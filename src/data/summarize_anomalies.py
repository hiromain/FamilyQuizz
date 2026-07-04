#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os
import json
import re

# On importe les fonctions du script existant
from verify_database import list_json_files, normalize_text, get_jaccard_similarity

DATA_DIR = os.path.dirname(os.path.abspath(__file__))

def main():
    json_files = list_json_files()
    
    anomalies = []
    question_map = {}
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
                "error": f"Fichier JSON illisible : {e}"
            })
            continue
            
        for subcat, q_list in data.items():
            if not isinstance(q_list, list):
                continue
                
            for idx, q in enumerate(q_list):
                if not isinstance(q, dict):
                    continue
                    
                q_id = q.get("id", f"sans_id_{filename}_{idx}")
                q_type = q.get("type", "inconnu")
                q_text = q.get("question", "").strip()
                answer = q.get("answer", "").strip()
                
                # Détection de doublons sémantiques de questions
                if q_text:
                    q_norm = normalize_text(q_text)
                    words1 = set(q_norm.split())
                    
                    for existing_info in question_map.values():
                        words2 = existing_info["words"]
                        sim = get_jaccard_similarity(words1, words2)
                        if sim > 0.85:
                            if existing_info["id"] == q_id:
                                anomalies.append({
                                    "file": filename,
                                    "category": subcat,
                                    "question_id": q_id,
                                    "error": f"ID en double : '{q_id}'"
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
                            "detail": f"Options : {options}"
                        })
                        
                    for opt_idx, opt in enumerate(options):
                        if not isinstance(opt, str) or not opt.strip():
                            anomalies.append({
                                "file": filename,
                                "category": subcat,
                                "question_id": q_id,
                                "error": f"L'option à l'index {opt_idx} est vide."
                            })
                        elif opt.strip() in ["Option A", "Option B", "Option C", "Option D"]:
                            anomalies.append({
                                "file": filename,
                                "category": subcat,
                                "question_id": q_id,
                                "error": f"L'option '{opt}' est un placeholder générique de test.",
                                "is_test_placeholder": True
                            })
                            
                    if not answer:
                        anomalies.append({
                            "file": filename,
                            "category": subcat,
                            "question_id": q_id,
                            "error": "La réponse correcte ('answer') est vide."
                        })
                    else:
                        if answer not in options:
                            matched_case_insensitive = [o for o in options if isinstance(o, str) and o.strip().lower() == answer.lower()]
                            if matched_case_insensitive:
                                anomalies.append({
                                    "file": filename,
                                    "category": subcat,
                                    "question_id": q_id,
                                    "error": f"Différence de casse pour la réponse '{answer}'.",
                                    "detail": f"Attendu : '{answer}', Trouvé : '{matched_case_insensitive[0]}'"
                                })
                            else:
                                anomalies.append({
                                    "file": filename,
                                    "category": subcat,
                                    "question_id": q_id,
                                    "error": f"La réponse correcte '{answer}' n'est pas dans les options.",
                                    "detail": f"Options : {options}"
                                })
                                
                    unique_options = set(normalize_text(o) for o in options if isinstance(o, str))
                    if len(unique_options) < len(options) and len(options) == 4:
                        anomalies.append({
                            "file": filename,
                            "category": subcat,
                            "question_id": q_id,
                            "error": "La question comporte des options identiques ou extrêmement similaires.",
                            "detail": f"Options : {options}"
                        })
                        
                elif q_type == "open":
                    total_open_checked += 1
                    if not answer:
                        anomalies.append({
                            "file": filename,
                            "category": subcat,
                            "question_id": q_id,
                            "error": "Question ouverte sans réponse correcte."
                        })

    # Regroupement et filtrage
    test_placeholders = 0
    real_anomalies = []
    
    for a in anomalies:
        if a.get("is_test_placeholder"):
            test_placeholders += 1
        else:
            real_anomalies.append(a)
            
    print(f"--- SYNTHÈSE DE QUALITÉ ---")
    print(f"Total fichiers analysés         : {len(json_files)}")
    print(f"Total questions QCM             : {total_qcm_checked}")
    print(f"Total questions ouvertes        : {total_open_checked}")
    print(f"Placeholders de test ignorés    : {test_placeholders}")
    print(f"Anomalies réelles détectées     : {len(real_anomalies)}")
    print("-" * 60)
    
    if not real_anomalies:
        print("\n[Parfait] Aucune anomalie réelle détectée sur l'ensemble de la base !")
    else:
        print(f"\nDétail des {len(real_anomalies)} anomalie(s) réelle(s) :")
        for i, a in enumerate(real_anomalies[:30]):
            print(f"\n[{i+1}] Dans {a['file']} > {a.get('category', 'Racine')}")
            if "question_id" in a:
                print(f"    Question ID : {a['question_id']}")
            print(f"    Erreur : {a['error']}")
            if "detail" in a:
                print(f"    Détails : {a['detail']}")

if __name__ == "__main__":
    main()
