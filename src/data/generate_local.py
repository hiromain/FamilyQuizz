#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os
import json
import urllib.request
import urllib.error
import re
import sys

# Dossier contenant les fichiers JSON
DATA_DIR = os.path.dirname(os.path.abspath(__file__))
OLLAMA_URL = "http://localhost:11434"

def normalize_text(text):
    """
    Normalise un texte pour faciliter les comparaisons (minuscules, sans accents, sans ponctuation).
    Cette fonction est comme un 'filtre nettoyant' qui permet d'ignorer les petites différences de majuscules ou d'accents.
    """
    if not text:
        return ""
    text = text.lower()
    accents = {
        'à': 'a', 'â': 'a', 'ä': 'a', 'á': 'a', 'ã': 'a', 'å': 'a',
        'é': 'e', 'è': 'e', 'ê': 'e', 'ë': 'e',
        'î': 'i', 'ï': 'i', 'í': 'i',
        'ô': 'o', 'ö': 'o', 'ó': 'o', 'õ': 'o',
        'û': 'u', 'ü': 'u', 'ù': 'u', 'ú': 'u',
        'ç': 'c', 'ñ': 'n'
    }
    for char, replacement in accents.items():
        text = text.replace(char, replacement)
    # Remplacer la ponctuation et caractères spéciaux par des espaces
    text = re.sub(r'[^a-z0-9\s]', ' ', text)
    # Enlever les espaces superflus
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def get_jaccard_similarity(str1, str2):
    """
    Calcule la similarité de Jaccard entre deux chaînes basées sur leurs mots uniques.
    Cette mesure calcule le pourcentage de mots partagés entre deux phrases.
    """
    words1 = set(normalize_text(str1).split())
    words2 = set(normalize_text(str2).split())
    if not words1 or not words2:
        return 0.0
    intersection = words1.intersection(words2)
    union = words1.union(words2)
    return len(intersection) / len(union)

def is_duplicate(new_q_text, existing_qs, threshold=0.55):
    """
    Vérifie si une question ressemble trop à une question déjà présente dans la base.
    Un seuil de 0.55 signifie qu'une question partageant plus de 55% de ses mots-clés
    avec une autre est détectée comme doublon potentiel.
    """
    for eq in existing_qs:
        eq_text = eq.get("question", "")
        # Correspondance exacte après normalisation
        if normalize_text(new_q_text) == normalize_text(eq_text):
            return True, eq_text
        # Similarité par part de mots en commun
        sim = get_jaccard_similarity(new_q_text, eq_text)
        if sim >= threshold:
            return True, eq_text
    return False, ""

def get_installed_models():
    """Récupère la liste des modèles installés localement dans Ollama."""
    try:
        req = urllib.request.Request(f"{OLLAMA_URL}/api/tags")
        with urllib.request.urlopen(req, timeout=5) as response:
            res = json.loads(response.read().decode('utf-8'))
            return [m['name'] for m in res.get('models', [])]
    except Exception:
        return []

def list_json_files():
    """Liste tous les fichiers JSON du dossier data."""
    files = [f for f in os.listdir(DATA_DIR) if f.endswith('.json') and not f.endswith('.bak') and not f.endswith('.metadata.json')]
    return sorted(files)

def get_subcategories(json_file_path):
    """Récupère les clés (sous-catégories) d'un fichier JSON."""
    try:
        with open(json_file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            if isinstance(data, dict):
                return sorted(list(data.keys()))
    except Exception as e:
        print(f"Erreur lors de la lecture du fichier {os.path.basename(json_file_path)} : {e}")
    return []

def clean_json_response(raw_text):
    """Nettoie la réponse brute d'Ollama pour en extraire le tableau JSON."""
    raw_text = raw_text.strip()
    
    # Enlever les blocs de code markdown ```json ... ```
    if raw_text.startswith("```"):
        # Trouver la fin de la première ligne de code block (ex: ```json)
        match = re.search(r"```[a-zA-Z]*\s*", raw_text)
        if match:
            raw_text = raw_text[match.end():]
        if raw_text.endswith("```"):
            raw_text = raw_text[:-3]
    
    raw_text = raw_text.strip()
    
    # Extraire le tableau JSON s'il y a du texte superflu avant ou après
    start_idx = raw_text.find('[')
    end_idx = raw_text.rfind(']')
    
    if start_idx != -1 and end_idx != -1 and end_idx > start_idx:
        return raw_text[start_idx:end_idx+1]
    
    return raw_text

def call_ollama(model, prompt):
    """Appelle l'API locale d'Ollama pour générer les questions."""
    payload = {
        "model": model,
        "prompt": prompt,
        "stream": False,
        "options": {
            "temperature": 0.7
        }
    }
    
    data = json.dumps(payload).encode('utf-8')
    headers = {"Content-Type": "application/json"}
    
    req = urllib.request.Request(f"{OLLAMA_URL}/api/generate", data=data, headers=headers)
    
    try:
        print(f"\n[Ollama] Génération en cours avec le modèle {model} (ceci peut prendre une minute)...")
        with urllib.request.urlopen(req, timeout=120) as response:
            res = json.loads(response.read().decode('utf-8'))
            return res.get('response', '')
    except urllib.error.URLError as e:
        print(f"\n[Erreur] Impossible de se connecter à Ollama sur {OLLAMA_URL}.")
        print("Veuillez vérifier que l'application Ollama est bien lancée localement.")
        print(f"Détail de l'erreur : {e}")
        sys.exit(1)
    except Exception as e:
        print(f"\n[Erreur] Une erreur est survenue lors de l'appel à Ollama : {e}")
        sys.exit(1)

def generate_ids(existing_questions, subcategory_key, count_new):
    """
    Génère des IDs uniques basés sur le préfixe existant.
    Ex: si les questions ont des IDs comme 'cinema_realisateurs_1', 'cinema_realisateurs_2',
    le script va continuer avec 'cinema_realisateurs_3', etc.
    """
    prefix = "q"
    start_num = 1
    
    # Tenter de trouver le préfixe dans les questions existantes
    if existing_questions:
        sample_id = existing_questions[0].get("id", "")
        # Extraire le préfixe texte et le numéro final
        match = re.match(r"^([a-zA-Z0-9_\-]+?)_?(\d+)$", sample_id)
        if match:
            prefix = match.group(1)
            # Trouver le numéro max existant
            nums = []
            for q in existing_questions:
                qid = q.get("id", "")
                m = re.match(rf"^{re.escape(prefix)}_?(\d+)$", qid)
                if m:
                    nums.append(int(m.group(1)))
            if nums:
                start_num = max(nums) + 1
        else:
            # Essayer de déduire à partir de la clé de sous-catégorie
            cleaned_key = re.sub(r'[^a-zA-Z0-9]', '_', subcategory_key.lower())
            cleaned_key = re.sub(r'_+', '_', cleaned_key).strip('_')
            prefix = cleaned_key
            start_num = len(existing_questions) + 1
    else:
        # Pas de questions existantes, on nettoie la clé de sous-catégorie
        cleaned_key = re.sub(r'[^a-zA-Z0-9]', '_', subcategory_key.lower())
        cleaned_key = re.sub(r'_+', '_', cleaned_key).strip('_')
        prefix = cleaned_key
        start_num = 1
        
    generated_ids = []
    for i in range(count_new):
        generated_ids.append(f"{prefix}_{start_num + i}")
    return generated_ids

def main():
    print("=" * 60)
    print("      GÉNÉRATEUR LOCAL DE QUESTIONS POUR FAMILYQUIZZ      ")
    print("=" * 60)
    
    # 1. Sélection du modèle local
    models = get_installed_models()
    if not models:
        print("\n[Attention] Aucun modèle local n'a été détecté dans Ollama.")
        print(f"Vérifiez que Ollama tourne sur {OLLAMA_URL} et possède des modèles installés.")
        user_model = input("Entrez manuellement le nom du modèle à utiliser (ex: gemma3:12b, llama3) : ").strip()
        if not user_model:
            print("Aucun modèle spécifié. Arrêt du script.")
            return
    else:
        print("\nModèles locaux disponibles :")
        for idx, m in enumerate(models):
            print(f"  [{idx + 1}] {m}")
        print(f"  [{len(models) + 1}] Entrer un autre nom de modèle...")
        
        while True:
            try:
                choice = input("\nChoisissez le modèle à utiliser (numéro) : ").strip()
                choice_idx = int(choice) - 1
                if 0 <= choice_idx < len(models):
                    user_model = models[choice_idx]
                    break
                elif choice_idx == len(models):
                    user_model = input("Entrez le nom du modèle : ").strip()
                    if user_model:
                        break
            except ValueError:
                pass
            print("Choix invalide, veuillez entrer un numéro de la liste.")

    # 2. Sélection de la catégorie (fichier JSON)
    json_files = list_json_files()
    if not json_files:
        print(f"\n[Erreur] Aucun fichier JSON de catégorie trouvé dans {DATA_DIR}.")
        return
        
    print("\nCatégories de questions disponibles (fichiers de données) :")
    for idx, f in enumerate(json_files):
        # Affichage propre (ex: cinema.json -> Cinema)
        pretty_name = f.replace('.json', '').replace('_', ' ').title()
        print(f"  [{idx + 1}] {pretty_name} ({f})")
        
    while True:
        try:
            choice = input("\nChoisissez la catégorie (numéro) : ").strip()
            choice_idx = int(choice) - 1
            if 0 <= choice_idx < len(json_files):
                selected_file = json_files[choice_idx]
                break
        except ValueError:
            pass
        print("Choix invalide, veuillez entrer un numéro de la liste.")

    # 3. Sélection de la sous-catégorie
    file_path = os.path.join(DATA_DIR, selected_file)
    subcategories = get_subcategories(file_path)
    
    if not subcategories:
        print(f"\nLe fichier {selected_file} est vide ou mal formaté.")
        subcategory_name = input("Entrez le nom d'une nouvelle sous-catégorie à créer : ").strip()
        if not subcategory_name:
            print("Aucune sous-catégorie créée. Arrêt.")
            return
    else:
        print("\nSous-catégories existantes :")
        for idx, sub in enumerate(subcategories):
            print(f"  [{idx + 1}] {sub}")
        print(f"  [{len(subcategories) + 1}] Créer une nouvelle sous-catégorie...")
        
        while True:
            try:
                choice = input("\nChoisissez la sous-catégorie (numéro) : ").strip()
                choice_idx = int(choice) - 1
                if 0 <= choice_idx < len(subcategories):
                    subcategory_name = subcategories[choice_idx]
                    break
                elif choice_idx == len(subcategories):
                    subcategory_name = input("Entrez le nom de la nouvelle sous-catégorie : ").strip()
                    if subcategory_name:
                        break
            except ValueError:
                pass
            print("Choix invalide, veuillez entrer un numéro de la liste.")

    # 4. Nombre de questions
    while True:
        try:
            num_input = input("\nNombre de questions à générer (par défaut: 5, max conseillé: 20) : ").strip()
            if not num_input:
                num_questions = 5
                break
            num_questions = int(num_input)
            if num_questions > 0:
                break
        except ValueError:
            pass
        print("Veuillez entrer un nombre entier positif.")

    # 5. Difficulté
    difficulties = ["Facile", "Moyen", "Difficile", "Mélangé"]
    print("\nDifficultés disponibles :")
    for idx, d in enumerate(difficulties):
        print(f"  [{idx + 1}] {d}")
    while True:
        try:
            choice = input("\nChoisissez la difficulté (numéro, par défaut: Mélangé) : ").strip()
            if not choice:
                selected_diff = "Mélangé"
                break
            choice_idx = int(choice) - 1
            if 0 <= choice_idx < len(difficulties):
                selected_diff = difficulties[choice_idx]
                break
        except ValueError:
            pass
        print("Choix invalide.")

    # 6. Type de questions
    q_types = ["QCM uniquement", "Questions ouvertes uniquement", "Mélange des deux"]
    print("\nTypes de questions :")
    for idx, t in enumerate(q_types):
        print(f"  [{idx + 1}] {t}")
    while True:
        try:
            choice = input("\nChoisissez le type (numéro, par défaut: Mélange des deux) : ").strip()
            if not choice:
                selected_type = "Mélange des deux"
                break
            choice_idx = int(choice) - 1
            if 0 <= choice_idx < len(q_types):
                selected_type = q_types[choice_idx]
                break
        except ValueError:
            pass
        print("Choix invalide.")

    # Récupérer les questions existantes pour cette sous-catégorie
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            full_data = json.load(f)
    except Exception:
        full_data = {}
        
    existing_questions = full_data.get(subcategory_name, [])
    
    # 7. Construction du prompt pour Ollama
    diff_instruction = f"de niveau '{selected_diff}'" if selected_diff != "Mélangé" else "avec un mélange équilibré de difficultés (Facile, Moyen, Difficile)"
    
    if selected_type == "QCM uniquement":
        type_instruction = "uniquement des questions de type QCM (avec options de choix)."
    elif selected_type == "Questions ouvertes uniquement":
        type_instruction = "uniquement des questions ouvertes (sans options de choix, uniquement la réponse)."
    else:
        type_instruction = "un mélange équilibré de QCM (avec 4 options de choix) et de questions ouvertes (sans options)."
        
    # Formater la liste des questions déjà existantes pour l'intégrer au prompt (anti-doublon au niveau LLM)
    existing_list_str = ""
    if existing_questions:
        # On extrait les titres des questions existantes
        existing_titles = [q.get("question", "") for q in existing_questions if q.get("question")]
        # On limite le contexte aux 50 plus récentes si jamais la liste est trop volumineuse
        if len(existing_titles) > 50:
            existing_titles = existing_titles[-50:]
        existing_list_str = "\n".join([f"- {title}" for title in existing_titles])

    avoid_duplicates_instruction = ""
    if existing_list_str:
        avoid_duplicates_instruction = f"""
CRITICAL - ÉVITEZ ABSOLUMENT LES DOUBLONS :
Voici la liste des questions déjà existantes dans notre base de données pour cette sous-catégorie.
Tu ne dois ABSOLUMENT PAS générer de questions portant sur les mêmes sujets, ni de questions trop similaires à celles-ci :
{existing_list_str}
"""

    prompt = f"""Génère exactement {num_questions} questions inédites pour un jeu familial en français.
Catégorie générale : {selected_file.replace('.json', '')}
Sous-catégorie spécifique : {subcategory_name}

Consignes impératives :
1. Difficulté : Les questions doivent être {diff_instruction}.
2. Type : Il faut générer {type_instruction}
3. Originalité : Rédige des questions intéressantes, amusantes et instructives avec des anecdotes solides. Évite les questions trop faciles ou bateaux de la culture populaire, cherche l'originalité !
4. Format de sortie : Tu dois retourner UNIQUEMENT un tableau JSON valide. Ne mets aucun texte d'introduction ni de conclusion, juste le JSON.{avoid_duplicates_instruction}

RÈGLE D'EXACTITUDE FACTUELLE ABSOLUE :
Pour chaque question, tu dois obligatoirement effectuer une réflexion de fact-checking dans le champ temporaire `"fact_checking_steps"`. Dans ce champ, tu dois :
- Lister les faits précis (dates, événements, protagonistes) liés à la question.
- Expliquer pourquoi la réponse sélectionnée est 100% vraie, exacte et incontestable.
- Pour les QCM, expliquer pourquoi les 3 autres options sont clairement fausses et distinctes de la bonne réponse.
Cette étape de réflexion te garantit d'éviter les erreurs factuelles, les dates inventées ou les mauvaises réponses.

Chaque question dans le tableau JSON doit respecter rigoureusement cette structure :
Pour un QCM :
{{
  "type": "qcm",
  "difficulty": "Facile" | "Moyen" | "Difficile",
  "fact_checking_steps": "Détaille ici ta réflexion rigoureuse pas à pas pour valider l'exactitude historique, scientifique ou culturelle absolue des faits et de la réponse.",
  "question": "Texte de la question ?",
  "options": ["Choix A", "Choix B", "Choix C", "Choix D"],
  "answer": "La réponse exacte (qui doit correspondre parfaitement et textuellement à l'une des 4 options)",
  "explanation": "Une anecdote historique, culturelle ou scientifique détaillée, intéressante et familiale en français."
}}

Pour une question ouverte :
{{
  "type": "open",
  "difficulty": "Facile" | "Moyen" | "Difficile",
  "fact_checking_steps": "Détaille ici ta réflexion rigoureuse pas à pas pour valider l'exactitude historique, scientifique ou culturelle absolue des faits et de la réponse.",
  "question": "Texte de la question ?",
  "answer": "La réponse exacte",
  "explanation": "Une anecdote historique, culturelle ou scientifique détaillée, intéressante et familiale en français."
}}

Génère maintenant les {num_questions} questions dans un tableau JSON unique [ ... ] :"""

    # Appel à Ollama
    raw_response = call_ollama(user_model, prompt)
    if not raw_response:
        print("\n[Erreur] Aucune réponse reçue d'Ollama.")
        return
        
    cleaned_json = clean_json_response(raw_response)
    
    try:
        new_questions = json.loads(cleaned_json)
        if not isinstance(new_questions, list):
            print("\n[Erreur] Ollama n'a pas renvoyé un tableau JSON valide.")
            print(f"Réponse brute nettoyée : {cleaned_json}")
            return
    except Exception as e:
        print("\n[Erreur] Impossible de parser le JSON généré par Ollama.")
        print(f"Erreur de parsing : {e}")
        print("-" * 50)
        print("Réponse brute de l'IA :")
        print(raw_response)
        print("-" * 50)
        return

    # 8. Post-traitement, validation rigoureuse et détection anti-doublon sémantique
    validated_questions = []
    skipped_duplicates = []
    skipped_invalid = []
    
    for idx, q in enumerate(new_questions):
        # Validation de base du dictionnaire
        if not isinstance(q, dict) or "question" not in q or "answer" not in q:
            skipped_invalid.append(f"Format invalide pour la question #{idx+1} (champs requis manquants)")
            continue
            
        q_text = q.get("question", "").strip()
        q_ans = q.get("answer", "").strip()
        
        if not q_text or not q_ans:
            skipped_invalid.append(f"Question ou réponse vide pour la question #{idx+1}")
            continue
            
        # Détermination propre du type de la question
        q_type = q.get("type", "qcm" if "options" in q else "open").lower()
        if q_type not in ["qcm", "open"]:
            q_type = "qcm" if "options" in q else "open"
        q["type"] = q_type
        
        # Validation spécifique aux QCM
        if q_type == "qcm":
            options = q.get("options", [])
            if not isinstance(options, list) or len(options) < 2:
                skipped_invalid.append(f"Le QCM '{q_text}' n'a pas une liste d'options valide.")
                continue
            
            # Nettoyer et trimmer chaque option
            options = [o.strip() for o in options if o]
            q["options"] = options
            
            # Vérifier si la réponse correspond textuellement à une des options (insensible à la casse)
            matched_option = None
            for opt in options:
                if opt.lower() == q_ans.lower():
                    matched_option = opt
                    break
            
            if matched_option:
                # S'assurer que l'écriture dans answer est identique à l'option retenue
                q["answer"] = matched_option
            else:
                skipped_invalid.append(f"Dans le QCM '{q_text}', la réponse '{q_ans}' n'est présente dans aucune des options : {options}")
                continue
                
        # Vérification anti-doublon sémantique par rapport à la base existante
        is_dup_exist, dup_text = is_duplicate(q_text, existing_questions)
        if is_dup_exist:
            skipped_duplicates.append(f"'{q_text}' (ressemble trop à : '{dup_text}')")
            continue
            
        # Vérification anti-doublon sémantique par rapport au lot en cours de validation
        is_dup_batch, dup_text = is_duplicate(q_text, validated_questions)
        if is_dup_batch:
            skipped_duplicates.append(f"'{q_text}' (doublon dans ce même lot généré)")
            continue
            
        # Nettoyage et normalisation des autres métadonnées
        if "difficulty" not in q:
            q["difficulty"] = "Moyen"
        else:
            q["difficulty"] = q["difficulty"].strip().title()
            if q["difficulty"] not in ["Facile", "Moyen", "Difficile"]:
                q["difficulty"] = "Moyen"
                
        if "explanation" not in q:
            q["explanation"] = ""
        else:
            q["explanation"] = q["explanation"].strip()
            
        # Suppression du champ temporaire de fact-checking pour ne pas alourdir la base de données
        q.pop("fact_checking_steps", None)
        
        validated_questions.append(q)
        
    # Attribution des identifiants uniques séquentiels
    ids = generate_ids(existing_questions, subcategory_name, len(validated_questions))
    for idx, q in enumerate(validated_questions):
        q["id"] = ids[idx]
        
    # Bilan de validation à l'utilisateur
    if skipped_duplicates:
        print("\n" + "!" * 10 + " ALERTE ANTI-DOUBLONS " + "!" * 10)
        print("Les questions suivantes ont été rejetées car elles existent déjà (ou y ressemblent trop) :")
        for dup in skipped_duplicates:
            print(f"  - {dup}")
            
    if skipped_invalid:
        print("\n" + "!" * 10 + " ANOMALIES DE STRUCTURE " + "!" * 10)
        print("Les questions suivantes ont été rejetées pour incohérence ou format erroné :")
        for inv in skipped_invalid:
            print(f"  - {inv}")
            
    if not validated_questions:
        print("\n[Échec] Aucune question valide n'a pu être retenue de ce lot.")
        print("Conseil : Essayez de relancer ou utilisez un modèle plus performant comme 'gemma2:9b'.")
        return
        
    print(f"\n[Succès] {len(validated_questions)} questions validées avec succès sur les {len(new_questions)} générées !")
    print("\nAperçu des questions retenues et prêtes à l'enregistrement :")
    for q in validated_questions:
        print(f"  - [{q['id']}] ({q['type'].upper()} - {q['difficulty']}) : {q['question']}")
        print(f"    Réponse correcte : {q['answer']}")
        if q['type'] == 'qcm':
            print(f"    Options : {q['options']}")
        if q.get('explanation'):
            print(f"    Anecdote : {q['explanation']}")
        print()

    # 9. Sauvegarde et fusion
    confirm = input("Voulez-vous fusionner et enregistrer ces questions validées dans le fichier de données ? (o/N) : ").strip().lower()
    if confirm == 'o':
        # Faire une sauvegarde de sécurité
        backup_file = file_path + ".bak"
        try:
            shutil.copy(file_path, backup_file)
        except Exception:
            pass
            
        # Ajouter les questions validées
        existing_questions.extend(validated_questions)
        full_data[subcategory_name] = existing_questions
        
        try:
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(full_data, f, indent=2, ensure_ascii=False)
            print(f"\n[Succès] Fichier de données mis à jour !")
            print(f"Emplacement : {file_path}")
            print(f"Nombre total de questions dans '{subcategory_name}' désormais : {len(existing_questions)}")
        except Exception as e:
            print(f"\n[Erreur] Impossible de sauvegarder les questions dans le fichier : {e}")
    else:
        print("\nEnregistrement annulé. Les questions générées n'ont pas été enregistrées.")

if __name__ == "__main__":
    import shutil
    try:
        main()
    except KeyboardInterrupt:
        print("\n\nOpération interrompue par l'utilisateur. À bientôt !")
