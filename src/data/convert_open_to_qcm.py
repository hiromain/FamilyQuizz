#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os
import json
import urllib.request
import urllib.error
import time
import random
import shutil
import re
import sys

DATA_DIR = os.path.dirname(os.path.abspath(__file__))
OLLAMA_URL = "http://localhost:11434"

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
    """Liste tous les fichiers JSON valides du dossier data."""
    files = [f for f in os.listdir(DATA_DIR) 
             if f.endswith('.json') 
             and not f.endswith('.bak') 
             and not f.endswith('.metadata.json')
             and f != 'package.json' 
             and f != 'database.rules.json']
    return sorted(files)

def count_open_questions(files):
    """Compte le nombre de questions ouvertes dans chaque fichier."""
    counts = {}
    total = 0
    for filename in files:
        filepath = os.path.join(DATA_DIR, filename)
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                data = json.load(f)
                file_total = 0
                if isinstance(data, dict):
                    for subcat, q_list in data.items():
                        if isinstance(q_list, list):
                            for q in q_list:
                                if isinstance(q, dict) and q.get('type') == 'open':
                                    file_total += 1
                counts[filename] = file_total
                total += file_total
        except Exception as e:
            print(f"[Erreur] Lecture impossible de {filename} : {e}")
            counts[filename] = 0
    return counts, total

def clean_json_response(raw_text):
    """Nettoie la réponse brute d'Ollama pour en extraire l'objet JSON."""
    raw_text = raw_text.strip()
    
    # Enlever les blocs de code markdown ```json ... ``` ou ``` ... ```
    if raw_text.startswith("```"):
        match = re.search(r"```[a-zA-Z0-9]*\s*", raw_text)
        if match:
            raw_text = raw_text[match.end():]
        if raw_text.endswith("```"):
            raw_text = raw_text[:-3]
    
    raw_text = raw_text.strip()
    
    # Extraire l'objet JSON s'il y a du texte superflu avant ou après
    start_idx = raw_text.find('{')
    end_idx = raw_text.rfind('}')
    
    if start_idx != -1 and end_idx != -1 and end_idx > start_idx:
        return raw_text[start_idx:end_idx+1]
    
    return raw_text

def call_ollama(model, prompt):
    """Appelle l'API locale d'Ollama."""
    payload = {
        "model": model,
        "prompt": prompt,
        "stream": False,
        "options": {
            "temperature": 0.5
        }
    }
    
    data = json.dumps(payload).encode('utf-8')
    headers = {"Content-Type": "application/json"}
    
    req = urllib.request.Request(f"{OLLAMA_URL}/api/generate", data=data, headers=headers)
    
    try:
        with urllib.request.urlopen(req, timeout=45) as response:
            res = json.loads(response.read().decode('utf-8'))
            return res.get('response', '')
    except Exception as e:
        print(f"\n[Erreur Ollama] Impossible de joindre le modèle ou délai dépassé : {e}")
        return None

def normalize_text(text):
    """Normalise un texte pour comparaison simple."""
    if not text:
        return ""
    text = text.lower()
    accents = {
        'à': 'a', 'â': 'a', 'ä': 'a', 'é': 'e', 'è': 'e', 'ê': 'e', 'ë': 'e',
        'î': 'i', 'ï': 'i', 'ô': 'o', 'ö': 'o', 'û': 'u', 'ü': 'u', 'ç': 'c'
    }
    for char, replacement in accents.items():
        text = text.replace(char, replacement)
    text = re.sub(r'[^a-z0-9]', '', text)
    return text

def convert_question(model, question_obj):
    """Envoie la question à Ollama pour obtenir 3 propositions fausses."""
    q_text = question_obj.get("question", "")
    answer = question_obj.get("answer", "")
    explanation = question_obj.get("explanation", "")
    difficulty = question_obj.get("difficulty", "Moyen")
    
    prompt = f"""Tu es un expert en quiz pour toute la famille.
Pour la question ouverte suivante, nous voulons la transformer en QCM à 4 choix.
La bonne réponse est déjà connue : "{answer}"

Ta tâche consiste à générer exactement 3 autres propositions (options) qui soient fausses, mais plausibles et intéressantes pour des joueurs de niveau de difficulté "{difficulty}".
Ces propositions doivent être en français, bien orthographiées et distinctes de la bonne réponse.

Question : {q_text}
Bonne réponse actuelle : {answer}
Explication/Contexte : {explanation}

Consignes strictes :
1. Génère exactement 3 choix faux (distracteurs).
2. Aucun de ces choix ne doit signifier la même chose ou être une autre formulation de la bonne réponse.
3. Retourne UNIQUEMENT un objet JSON avec la clé "options_fausses" contenant un tableau de ces 3 propositions sous forme de chaînes de caractères.
4. Pas de bavardage, pas d'explication, pas de markdown (pas de ```json), juste le JSON brut.

Exemple de sortie attendue :
{{
  "options_fausses": [
    "Première mauvaise proposition",
    "Deuxième mauvaise proposition",
    "Troisième mauvaise proposition"
  ]
}}
"""
    
    # Tentative d'appel avec retours (max 3 essais)
    for attempt in range(3):
        raw_res = call_ollama(model, prompt)
        if not raw_res:
            time.sleep(2)
            continue
            
        cleaned = clean_json_response(raw_res)
        try:
            parsed = json.loads(cleaned)
            options_fausses = parsed.get("options_fausses", [])
            
            # Validation des options reçues
            if isinstance(options_fausses, list) and len(options_fausses) == 3:
                # Vérifier qu'aucune option fausse n'est identique à la bonne réponse
                norm_answer = normalize_text(answer)
                valid = True
                cleaned_options_fausses = []
                
                for opt in options_fausses:
                    if not isinstance(opt, str) or not opt.strip():
                        valid = False
                        break
                    opt_stripped = opt.strip()
                    if normalize_text(opt_stripped) == norm_answer:
                        valid = False
                        break
                    cleaned_options_fausses.append(opt_stripped)
                    
                if valid:
                    # Tout est ok, on construit la liste des 4 choix
                    all_options = cleaned_options_fausses + [answer]
                    random.shuffle(all_options)
                    return all_options
                    
        except Exception:
            pass
            
        # Si échec, on attend un peu avant de retenter
        time.sleep(1.5)
        
    return None

def main():
    print("=" * 60)
    print("      CONVERTISSEUR DE QUESTIONS OUVERTES EN QCM (OLLAMA)      ")
    print("=" * 60)
    
    # 1. Vérification Ollama et choix du modèle
    models = get_installed_models()
    if not models:
        print("\n[Erreur] Aucun modèle local n'a été détecté dans Ollama.")
        print(f"Veuillez démarrer Ollama sur {OLLAMA_URL} et installer un modèle.")
        return
        
    print("\nModèles locaux disponibles :")
    recommended_idx = -1
    for idx, m in enumerate(models):
        rec_str = ""
        if "gemma3:12b" in m:
            recommended_idx = idx
            rec_str = " (Recommandé pour le français)"
        print(f"  [{idx + 1}] {m}{rec_str}")
        
    default_choice = str(recommended_idx + 1) if recommended_idx != -1 else "1"
    
    while True:
        choice = input(f"\nChoisissez le modèle à utiliser (par défaut : [{default_choice}]) : ").strip()
        if not choice:
            choice = default_choice
        try:
            choice_idx = int(choice) - 1
            if 0 <= choice_idx < len(models):
                selected_model = models[choice_idx]
                break
        except ValueError:
            pass
        print("Choix invalide.")

    # 2. Analyse des questions ouvertes existantes
    json_files = list_json_files()
    if not json_files:
        print("\nAucun fichier JSON de questions trouvé.")
        return
        
    print("\nAnalyse des fichiers en cours...")
    counts, total_open = count_open_questions(json_files)
    
    if total_open == 0:
        print("\n[Félicitations] Aucune question de type ouvert trouvée. Tout est déjà en QCM !")
        return
        
    print(f"\nNombre de questions ouvertes à convertir par fichier (Total : {total_open}) :")
    active_files = []
    for idx, f in enumerate(json_files):
        count = counts[f]
        if count > 0:
            active_files.append(f)
            print(f"  [{len(active_files)}] {f} : {count} questions ouvertes")
            
    print(f"  [{len(active_files) + 1}] Tous les fichiers ({total_open} questions)")
    
    while True:
        file_choice = input(f"\nChoisissez le fichier à traiter (numéro, par défaut : Tous) : ").strip()
        if not file_choice:
            files_to_process = active_files
            break
        try:
            fc_idx = int(file_choice) - 1
            if 0 <= fc_idx < len(active_files):
                files_to_process = [active_files[fc_idx]]
                break
            elif fc_idx == len(active_files):
                files_to_process = active_files
                break
        except ValueError:
            pass
        print("Choix invalide.")
        
    # Calculer le nombre total à traiter pour la sélection
    total_to_process = sum(counts[f] for f in files_to_process)
    print(f"\nVous avez sélectionné {len(files_to_process)} fichier(s) contenant {total_to_process} questions ouvertes.")
    
    # Option de limite (pour faire des tests)
    limit_input = input("Nombre maximum de questions à convertir pour cette session (Entrée pour TOUTES) : ").strip()
    max_questions = None
    if limit_input:
        try:
            max_questions = int(limit_input)
            if max_questions <= 0:
                max_questions = None
        except ValueError:
            print("Entrée invalide. Pas de limite appliquée.")

    # 3. Paramètres de temporisation (Refroidissement du GPU)
    print("\n--- PARAMÈTRES DE REFROIDISSEMENT DU GPU ---")
    
    delay_input = input("Pause entre chaque question en secondes (par défaut : 2) : ").strip()
    delay_between = float(delay_input) if delay_input else 2.0
    
    batch_size_input = input("Taille du lot avant grande pause de refroidissement (par défaut : 30) : ").strip()
    batch_size = int(batch_size_input) if batch_size_input else 30
    
    batch_delay_input = input("Durée de la grande pause de refroidissement en secondes (par défaut : 60) : ").strip()
    batch_delay = float(batch_delay_input) if batch_delay_input else 60.0

    # 4. Confirmation de démarrage
    print(f"\nPrêt à démarrer avec le modèle '{selected_model}'.")
    print(f"Paramètres : {delay_between}s entre chaque question. Grande pause de {batch_delay}s toutes les {batch_size} questions.")
    confirm = input("Voulez-vous lancer la conversion ? (o/N) : ").strip().lower()
    if confirm != 'o':
        print("Annulé.")
        return
        
    # 5. Boucle de conversion
    converted_count = 0
    skipped_count = 0
    questions_processed_in_batch = 0
    start_time = time.time()
    
    try:
        for filename in files_to_process:
            filepath = os.path.join(DATA_DIR, filename)
            backup_path = filepath + ".bak"
            
            # Créer une sauvegarde de sécurité si elle n'existe pas déjà
            if not os.path.exists(backup_path):
                shutil.copy(filepath, backup_path)
                print(f"\n[Sauvegarde] Copie créée pour {filename}")
                
            # Charger les données
            with open(filepath, 'r', encoding='utf-8') as f:
                data = json.load(f)
                
            # Parcourir et modifier les questions
            file_modified = False
            for subcat, q_list in data.items():
                if not isinstance(q_list, list):
                    continue
                    
                for idx, q in enumerate(q_list):
                    # Vérifier si on a atteint la limite globale
                    if max_questions and converted_count >= max_questions:
                        break
                        
                    if q.get('type') == 'open':
                        q_id = q.get('id', 'Inconnu')
                        q_text = q.get('question', '')[:50]
                        print(f"\n[{converted_count + 1}] Conversion de {q_id} ({q_text}...)")
                        
                        # Appel à Ollama
                        options = convert_question(selected_model, q)
                        
                        if options:
                            # Mise à jour de la question en QCM
                            q['type'] = 'qcm'
                            q['options'] = options
                            # s'assurer que answer est propre
                            q['answer'] = q['answer'].strip()
                            
                            file_modified = True
                            converted_count += 1
                            questions_processed_in_batch += 1
                            print(f"  -> Succès ! Choix générés : {options}")
                            
                            # Sauvegarde immédiate après chaque modification réussie pour résilience
                            with open(filepath, 'w', encoding='utf-8') as f_out:
                                json.dump(data, f_out, indent=2, ensure_ascii=False)
                        else:
                            skipped_count += 1
                            print("  -> Échec de la génération des choix (Ollama n'a pas renvoyé un format valide). Question conservée en ouvert.")
                            
                        # Si on a atteint la limite, on s'arrête
                        if max_questions and converted_count >= max_questions:
                            break
                            
                        # Pause de refroidissement classique
                        time.sleep(delay_between)
                        
                        # Grande pause de refroidissement si taille du lot atteinte
                        if questions_processed_in_batch >= batch_size:
                            print(f"\n" + "*" * 20 + f" GPU COOL DOWN : Pause de {batch_delay}s " + "*" * 20)
                            for remaining in range(int(batch_delay), 0, -1):
                                sys.stdout.write(f"\rRefroidissement de la carte graphique... {remaining} secondes restantes...")
                                sys.stdout.flush()
                                time.sleep(1)
                            sys.stdout.write("\rRefroidissement terminé ! Reprise de la conversion...\n")
                            sys.stdout.flush()
                            questions_processed_in_batch = 0
                            
                if max_questions and converted_count >= max_questions:
                    break
                    
            if max_questions and converted_count >= max_questions:
                print("\nLimite maximale de questions converties atteinte.")
                break
                
    except KeyboardInterrupt:
        print("\n\n[Interruption] Le script a été mis en pause par l'utilisateur. Toutes les modifications effectuées jusqu'ici ont été enregistrées.")
        
    # 6. Bilan final
    elapsed_time = time.time() - start_time
    minutes = int(elapsed_time // 60)
    seconds = int(elapsed_time % 60)
    
    print("\n" + "=" * 60)
    print("      BILAN DE LA SESSION DE CONVERSION      ")
    print("=" * 60)
    print(f"Questions converties en QCM avec succès : {converted_count}")
    print(f"Questions ignorées (erreurs)            : {skipped_count}")
    print(f"Temps écoulé                            : {minutes} min {seconds} s")
    print("Toutes les modifications sont enregistrées de façon sécurisée.")
    print("Vous pouvez relancer ce script à tout moment pour reprendre le travail.")
    print("=" * 60)

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\nAu revoir !")
