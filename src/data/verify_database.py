#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os
import json
import re
import sys

DATA_DIR = os.path.dirname(os.path.abspath(__file__))

def list_json_files():
    """Liste tous les fichiers JSON valides du dossier data."""
    files = [f for f in os.listdir(DATA_DIR) 
             if f.endswith('.json') 
             and not f.endswith('.bak') 
             and not f.endswith('.metadata.json')
             and f != 'package.json' 
             and f != 'database.rules.json']
    return sorted(files)

def normalize_text(text):
    """Normalise un texte pour faciliter les comparaisons."""
    if not text:
        return ""
    text = text.lower()
    accents = {
        'à': 'a', 'â': 'a', 'ä': 'a', 'é': 'e', 'è': 'e', 'ê': 'e', 'ë': 'e',
        'î': 'i', 'ï': 'i', 'ô': 'o', 'ö': 'o', 'û': 'u', 'ü': 'u', 'ç': 'c', 'ñ': 'n'
    }
    for char, replacement in accents.items():
        text = text.replace(char, replacement)
    text = re.sub(r'[^a-z0-9\s]', ' ', text)
    return ' '.join(text.split())

def get_jaccard_similarity(words1, words2):
    """Similarité de Jaccard pré-calculée."""
    if not words1 or not words2:
        return 0.0
    intersection = words1.intersection(words2)
    union = words1.union(words2)
    return len(intersection) / len(union)

def main():
    print("=" * 60)
    print("      DIAGNOSTIC DE QUALITÉ OPTIMISÉ DE LA BASE DE DONNÉES      ")
    print("=" * 60)
    
    json_files = list_json_files()
    
    anomalies = []
    question_map = {} # Pour la détection rapide de doublons sémantiques
    total_qcm_checked = 0
    total_open_checked = 0
    
    for filename in json_files:
        filepath = os.path.join(DATA_DIR, filename)
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                data = json.load(f)
        except Exception as e:
            anomalies.append({
                "file": filename,
                "error": f"Fichier JSON illisible ou corrompu : {e}"
            })
            continue
            
        if not isinstance(data, dict):
            anomalies.append({
                "file": filename,
                "error": "La structure racine doit être un objet/dictionnaire."
            })
            continue
            
        for subcat, q_list in data.items():
            if not isinstance(q_list, list):
                anomalies.append({
                    "file": filename,
                    "category": subcat,
                    "error": "La sous-catégorie doit contenir une liste de questions."
                })
                continue
                
            for idx, q in enumerate(q_list):
                if not isinstance(q, dict):
                    anomalies.append({
                        "file": filename,
                        "category": subcat,
                        "error": f"Question à l'index {idx} n'est pas un dictionnaire/objet."
                    })
                    continue
                    
                q_id = q.get("id", f"sans_id_{filename}_{idx}")
                q_type = q.get("type", "inconnu")
                q_text = q.get("question", "").strip()
                answer = q.get("answer", "").strip()
                
                # Détection de doublons sémantiques de questions (optimisée)
                if q_text:
                    q_norm = normalize_text(q_text)
                    words1 = set(q_norm.split())
                    
                    # Recherche de questions très similaires
                    for existing_info in question_map.values():
                        words2 = existing_info["words"]
                        sim = get_jaccard_similarity(words1, words2)
                        if sim > 0.85:
                            # Si c'est exactement le même ID, c'est une erreur de duplication de clé
                            if existing_info["id"] == q_id:
                                anomalies.append({
                                    "file": filename,
                                    "category": subcat,
                                    "question_id": q_id,
                                    "error": f"ID en double : '{q_id}' présent plusieurs fois."
                                })
                            else:
                                anomalies.append({
                                    "file": filename,
                                    "category": subcat,
                                    "question_id": q_id,
                                    "error": f"Question doublon sémantique (similarité {sim:.1%}) avec {existing_info['id']} dans {existing_info['file']}.",
                                    "detail": f"Q1: '{q_text}'\nQ2: '{existing_info['text']}'"
                                })
                                
                    question_map[q_norm] = {
                        "id": q_id,
                        "file": filename,
                        "text": q_text,
                        "words": words1
                    }
                
                if q_type == "qcm":
                    total_qcm_checked += 1
                    options = q.get("options", [])
                    
                    # 1. Vérification des options
                    if not isinstance(options, list):
                        anomalies.append({
                            "file": filename,
                            "category": subcat,
                            "question_id": q_id,
                            "error": "Le champ 'options' n'est pas une liste."
                        })
                        continue
                        
                    if len(options) != 4:
                        anomalies.append({
                            "file": filename,
                            "category": subcat,
                            "question_id": q_id,
                            "error": f"Nombre d'options incorrect : attendu 4, trouvé {len(options)}.",
                            "detail": f"Options actuelles : {options}"
                        })
                        
                    # 2. Vérification des valeurs vides ou placeholders
                    for opt_idx, opt in enumerate(options):
                        if not isinstance(opt, str) or not opt.strip():
                            anomalies.append({
                                "file": filename,
                                "category": subcat,
                                "question_id": q_id,
                                "error": f"L'option à l'index {opt_idx} est vide ou invalide."
                            })
                        elif opt.strip() in ["Option A", "Option B", "Option C", "Option D"]:
                            anomalies.append({
                                "file": filename,
                                "category": subcat,
                                "question_id": q_id,
                                "error": f"L'option '{opt}' est un placeholder générique non remplacé."
                            })
                            
                    # 3. Présence et exactitude de la réponse dans les options
                    if not answer:
                        anomalies.append({
                            "file": filename,
                            "category": subcat,
                            "question_id": q_id,
                            "error": "La réponse correcte ('answer') est vide."
                        })
                    else:
                        # Recherche exacte
                        if answer not in options:
                            # Recherche insensible à la casse
                            matched_case_insensitive = [o for o in options if isinstance(o, str) and o.strip().lower() == answer.lower()]
                            if matched_case_insensitive:
                                anomalies.append({
                                    "file": filename,
                                    "category": subcat,
                                    "question_id": q_id,
                                    "error": f"La réponse '{answer}' correspond à une option mais avec des différences de casse.",
                                    "detail": f"Attendu : '{answer}', Trouvé dans options : '{matched_case_insensitive[0]}'"
                                })
                            else:
                                anomalies.append({
                                    "file": filename,
                                    "category": subcat,
                                    "question_id": q_id,
                                    "error": f"La réponse correcte '{answer}' n'est pas présente dans la liste des options.",
                                    "detail": f"Options : {options}"
                                })
                                
                    # 4. Détection de doublons dans les options d'une même question
                    unique_options = set(normalize_text(o) for o in options if isinstance(o, str))
                    if len(unique_options) < len(options) and len(options) == 4:
                        anomalies.append({
                            "file": filename,
                            "category": subcat,
                            "question_id": q_id,
                            "error": "La question comporte des options identiques ou extrêmement similaires (doublon d'options).",
                            "detail": f"Options : {options}"
                        })
                        
                elif q_type == "open":
                    total_open_checked += 1
                    if not answer:
                        anomalies.append({
                            "file": filename,
                            "category": subcat,
                            "question_id": q_id,
                            "error": "Question ouverte sans réponse correcte renseignée."
                        })
                else:
                    anomalies.append({
                        "file": filename,
                        "category": subcat,
                        "question_id": q_id,
                        "error": f"Type de question inconnu : '{q_type}'"
                    })

    # Affichage du bilan
    print(f"\n--- BILAN DE L'ANALYSE ---")
    print(f"Total fichiers analysés    : {len(json_files)}")
    print(f"Total questions QCM        : {total_qcm_checked}")
    print(f"Total questions ouvertes   : {total_open_checked}")
    print(f"Total anomalies détectées  : {len(anomalies)}")
    print("-" * 60)
    
    if not anomalies:
        print("\n[Parfait] Aucune anomalie, doublon ou incohérence de réponse détectée !")
        print("La base de données est propre, cohérente et prête à l'emploi.")
    else:
        print(f"\n[Alerte] {len(anomalies)} anomalie(s) détectée(s) :")
        for i, a in enumerate(anomalies):
            print(f"\n[{i+1}] Dans {a['file']} > {a.get('category', 'Racine')}")
            if "question_id" in a:
                print(f"    Question ID : {a['question_id']}")
            print(f"    Erreur : {a['error']}")
            if "detail" in a:
                print(f"    Détails :\n{a['detail']}")
                
if __name__ == "__main__":
    main()
