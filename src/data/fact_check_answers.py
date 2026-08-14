#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os
import json
import urllib.request
import time
import sys
import re
from verify_database import list_json_files

DATA_DIR = os.path.dirname(os.path.abspath(__file__))
OLLAMA_URL = "http://localhost:11434"

def get_installed_models():
    try:
        req = urllib.request.Request(f"{OLLAMA_URL}/api/tags")
        with urllib.request.urlopen(req, timeout=5) as response:
            res = json.loads(response.read().decode('utf-8'))
            return [m['name'] for m in res.get('models', [])]
    except Exception:
        return []

def call_ollama(model, prompt):
    payload = {
        "model": model,
        "prompt": prompt,
        "stream": False,
        "options": {
            "temperature": 0.1 # Température basse pour un fact-checking factuel et rigoureux
        }
    }
    data = json.dumps(payload).encode('utf-8')
    headers = {"Content-Type": "application/json"}
    req = urllib.request.Request(f"{OLLAMA_URL}/api/generate", data=data, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=30) as response:
            res = json.loads(response.read().decode('utf-8'))
            return res.get('response', '')
    except Exception as e:
        print(f"\n[Erreur Ollama] {e}")
        return None

def clean_json_response(raw_text):
    raw_text = raw_text.strip()
    if raw_text.startswith("```"):
        match = re.search(r"```[a-zA-Z0-9]*\s*", raw_text)
        if match:
            raw_text = raw_text[match.end():]
        if raw_text.endswith("```"):
            raw_text = raw_text[:-3]
    raw_text = raw_text.strip()
    start_idx = raw_text.find('{')
    end_idx = raw_text.rfind('}')
    if start_idx != -1 and end_idx != -1 and end_idx > start_idx:
        return raw_text[start_idx:end_idx+1]
    return raw_text

def fact_check_question(model, q_text, answer, explanation):
    prompt = f"""Tu es un historien et scientifique expert chargé de vérifier l'exactitude des réponses d'un grand quiz familial.
Vérifie rigoureusement si la réponse correcte désignée est vraie, exacte et sans ambiguïté.

Question : {q_text}
Réponse désignée : {answer}
Explication fournie : {explanation}

Ta tâche :
1. Analyse si la réponse répond de façon vraie, exacte et incontestable à la question.
2. Si la réponse est fausse, erronée, périmée, ou s'il y a une coquille historique ou scientifique majeure, signale-le (est_correct = false).
3. Si la réponse est correcte et exacte, signale-le (est_correct = true).

Retourne UNIQUEMENT un objet JSON brut avec la structure suivante :
{{
  "est_correct": true ou false,
  "raison": "Si c'est faux ou ambigu, explique précisément l'erreur en français. Si c'est correct, laisse ce champ vide."
}}
Pas de bavardage, pas de markdown (pas de ```json), juste le JSON brut.
"""
    raw_res = call_ollama(model, prompt)
    if not raw_res:
        return None
    import re
    cleaned = clean_json_response(raw_res)
    try:
        parsed = json.loads(cleaned)
        return parsed
    except Exception:
        return None

def main():
    print("=" * 60)
    print("      VÉRIFICATEUR D'EXACTITUDE DES RÉPONSES (OLLAMA)      ")
    print("=" * 60)
    
    models = get_installed_models()
    if not models:
        print("\n[Erreur] Aucun modèle détecté dans Ollama.")
        return
        
    print("\nModèles disponibles :")
    recommended_idx = -1
    for idx, m in enumerate(models):
        rec_str = ""
        if "gemma3:12b" in m:
            recommended_idx = idx
            rec_str = " (Recommandé)"
        elif "gemma4:26b" in m and recommended_idx == -1:
            recommended_idx = idx
            rec_str = " (Recommandé)"
        print(f"  [{idx + 1}] {m}{rec_str}")
        
    default_choice = str(recommended_idx + 1) if recommended_idx != -1 else "1"
    
    while True:
        choice = input(f"\nChoisissez le modèle (par défaut : [{default_choice}]) : ").strip()
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

    json_files = list_json_files()
    print("\nFichiers disponibles :")
    for idx, f in enumerate(json_files):
        print(f"  [{idx + 1}] {f}")
    print(f"  [{len(json_files) + 1}] Tous les fichiers")
    
    while True:
        file_choice = input(f"\nChoisissez le fichier à vérifier (numéro, par défaut : Tous) : ").strip()
        if not file_choice:
            files_to_process = json_files
            break
        try:
            fc_idx = int(file_choice) - 1
            if 0 <= fc_idx < len(json_files):
                files_to_process = [json_files[fc_idx]]
                break
            elif fc_idx == len(json_files):
                files_to_process = json_files
                break
        except ValueError:
            pass
        print("Choix invalide.")

    # Compter les questions QCM à vérifier
    questions_to_verify = []
    for filename in files_to_process:
        filepath = os.path.join(DATA_DIR, filename)
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                data = json.load(f)
                for subcat, q_list in data.items():
                    if isinstance(q_list, list):
                        for q in q_list:
                            if isinstance(q, dict) and q.get('type') == 'qcm':
                                # Exclure les placeholders de test
                                options = q.get("options", [])
                                is_test = False
                                if isinstance(options, list):
                                    for opt in options:
                                        if isinstance(opt, str) and opt.strip() in ["Option A", "Option B", "Option C", "Option D"]:
                                            is_test = True
                                            break
                                if not is_test:
                                    questions_to_verify.append({
                                        "file": filename,
                                        "category": subcat,
                                        "question": q
                                    })
        except Exception as e:
            print(f"Erreur de lecture sur {filename} : {e}")

    total_q = len(questions_to_verify)
    print(f"\nNombre total de questions QCM à fact-checker : {total_q}")
    
    limit_input = input("Nombre de questions à vérifier pour ce test (Entrée pour TOUTES) : ").strip()
    if limit_input:
        try:
            limit = int(limit_input)
            questions_to_verify = questions_to_verify[:limit]
            total_q = len(questions_to_verify)
        except ValueError:
            pass
            
    print(f"\nLancement de la vérification sur {total_q} questions...")
    confirm = input("Confirmer ? (o/N) : ").strip().lower()
    if confirm != 'o':
        return

    delay_input = input("Pause entre chaque vérification en secondes (par défaut : 0.5) : ").strip()
    delay = float(delay_input) if delay_input else 0.5

    errors_found = []
    checked_count = 0
    start_time = time.time()
    
    try:
        for item in questions_to_verify:
            filename = item["file"]
            subcat = item["category"]
            q = item["question"]
            q_id = q.get("id", "Inconnu")
            q_text = q.get("question", "")
            answer = q.get("answer", "")
            explanation = q.get("explanation", "")
            
            print(f"[{checked_count + 1}/{total_q}] Vérification de {q_id} dans {filename}...")
            
            result = fact_check_question(selected_model, q_text, answer, explanation)
            checked_count += 1
            
            if result and not result.get("est_correct", True):
                reason = result.get("raison", "Erreur indéterminée.")
                print(f"  -> ⚠️ ERREUR SIGNALÉE : {reason}")
                errors_found.append({
                    "file": filename,
                    "category": subcat,
                    "id": q_id,
                    "question": q_text,
                    "answer": answer,
                    "explanation": explanation,
                    "error_reason": reason
                })
            else:
                print("  -> OK (Vraie/Exacte)")
                
            time.sleep(delay)
            
    except KeyboardInterrupt:
        print("\n\nVérification interrompue.")
        
    elapsed = time.time() - start_time
    
    # Écrire le rapport
    report_path = os.path.join(DATA_DIR, "fact_check_report.json")
    with open(report_path, 'w', encoding='utf-8') as f:
        json.dump(errors_found, f, indent=2, ensure_ascii=False)
        
    print("\n" + "=" * 60)
    print("      BILAN DU FACT-CHECKING      ")
    print("=" * 60)
    print(f"Questions vérifiées         : {checked_count}")
    print(f"Questions suspectes/fausses : {len(errors_found)}")
    print(f"Temps écoulé                : {int(elapsed // 60)}m {int(elapsed % 60)}s")
    print(f"Rapport enregistré dans     : {report_path}")
    print("=" * 60)

if __name__ == "__main__":
    main()
