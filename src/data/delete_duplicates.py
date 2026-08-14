#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os
import json
import shutil
from verify_database import list_json_files, normalize_text, get_jaccard_similarity

DATA_DIR = os.path.dirname(os.path.abspath(__file__))

def main():
    print("=" * 60)
    print("      SUPPRESSION DES DOUBLONS DE QUESTIONS      ")
    print("=" * 60)
    
    json_files = list_json_files()
    
    question_map = {}
    deleted_count = 0
    modified_files = set()
    
    for filename in json_files:
        filepath = os.path.join(DATA_DIR, filename)
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                data = json.load(f)
        except Exception as e:
            print(f"[Erreur] Fichier {filename} illisible : {e}")
            continue
            
        new_data = {}
        file_modified = False
        
        for subcat, q_list in data.items():
            if not isinstance(q_list, list):
                new_data[subcat] = q_list
                continue
                
            filtered_q_list = []
            for idx, q in enumerate(q_list):
                if not isinstance(q, dict):
                    filtered_q_list.append(q)
                    continue
                    
                q_id = q.get("id", f"sans_id_{filename}_{idx}")
                q_text = q.get("question", "").strip()
                
                # Ignorer les placeholders de test
                options = q.get("options", [])
                is_test = False
                if isinstance(options, list):
                    for opt in options:
                        if isinstance(opt, str) and opt.strip() in ["Option A", "Option B", "Option C", "Option D"]:
                            is_test = True
                            break
                            
                if not q_text or is_test:
                    filtered_q_list.append(q)
                    continue
                    
                q_norm = normalize_text(q_text)
                words1 = set(q_norm.split())
                
                # Vérifier si similaire à une question déjà enregistrée
                is_duplicate = False
                duplicate_info = None
                
                for existing_info in question_map.values():
                    words2 = existing_info["words"]
                    sim = get_jaccard_similarity(words1, words2)
                    if sim > 0.85:
                        is_duplicate = True
                        duplicate_info = existing_info
                        break
                        
                if is_duplicate:
                    print(f"\n[Suppression] Doublon détecté dans {filename} > {subcat} :")
                    print(f"  - ID supprimé : {q_id}")
                    print(f"  - Question    : '{q_text}'")
                    print(f"  - Ressemble à : '{duplicate_info['text']}' (ID: {duplicate_info['id']} dans {duplicate_info['file']})")
                    deleted_count += 1
                    file_modified = True
                else:
                    filtered_q_list.append(q)
                    # Enregistrer la question originale pour les comparaisons futures
                    question_map[q_norm] = {
                        "id": q_id,
                        "file": filename,
                        "text": q_text,
                        "words": words1
                    }
                    
            new_data[subcat] = filtered_q_list
            
        if file_modified:
            # Créer une sauvegarde
            backup_path = filepath + ".bak"
            shutil.copy(filepath, backup_path)
            
            # Enregistrer les modifications
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(new_data, f, indent=2, ensure_ascii=False)
                
            modified_files.add(filename)
            print(f"[Sauvegardé] Fichier {filename} mis à jour.")
            
    print("\n" + "=" * 60)
    print("      BILAN DE LA SUPPRESSION      ")
    print("=" * 60)
    print(f"Nombre total de doublons supprimés : {deleted_count}")
    print(f"Nombre de fichiers mis à jour      : {len(modified_files)} ({', '.join(modified_files)})")
    print("=" * 60)

if __name__ == "__main__":
    main()
