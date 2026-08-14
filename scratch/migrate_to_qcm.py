import json
import glob
import os
import random
import requests
import time

OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL = "llama3.2:latest"
CHECKPOINT_FILE = "scratch/migration_checkpoint.json"
BATCH_SIZE = 20

def load_checkpoint():
    if os.path.exists(CHECKPOINT_FILE):
        with open(CHECKPOINT_FILE, 'r') as f:
            return json.load(f)
    return []

def save_checkpoint(processed_ids):
    with open(CHECKPOINT_FILE, 'w') as f:
        json.dump(processed_ids, f)

def generate_distractors_batch(questions_batch):
    prompt = "Tu dois générer des fausses réponses pour un QCM en français.\n"
    prompt += f"Pour les {len(questions_batch)} questions suivantes, renvoie UNIQUEMENT un tableau JSON valide. Ne renvoie AUCUN autre texte.\n"
    prompt += f"Le tableau doit contenir {len(questions_batch)} tableaux, chacun contenant exactement 3 fausses réponses (leurres crédibles).\n\n"

    for i, q in enumerate(questions_batch):
        prompt += f"{i+1}. {q['question']} (Réponse: {q['answer']})\n"

    prompt += "\nExemple de sortie attendue :\n[\n"
    for _ in range(len(questions_batch) - 1):
        prompt += "  [\"Leurre 1\", \"Leurre 2\", \"Leurre 3\"],\n"
    prompt += "  [\"Leurre 1\", \"Leurre 2\", \"Leurre 3\"]\n]"

    try:
        resp = requests.post(
            OLLAMA_URL,
            json={"model": MODEL, "prompt": prompt, "stream": False, "options": {"temperature": 0.5}},
            timeout=300
        )
        if resp.status_code == 200:
            text = resp.json().get("response", "")
            start = text.find('[')
            end = text.rfind(']')
            if start != -1 and end != -1 and end > start:
                json_str = text[start:end+1]
                data = json.loads(json_str)
                if isinstance(data, list) and len(data) == len(questions_batch):
                    return data
    except Exception as e:
        print(f"Erreur API LLM : {e}")
    return None

def process_batch(batch, filepath, data, processed_ids):
    distractors_list = generate_distractors_batch(batch)
    if not distractors_list:
        print("Échec de la génération du lot, on passe (le script réessaiera plus tard si relancé).")
        return False

    for i, q_ref in enumerate(batch):
        distractors = [str(item).strip() for item in distractors_list[i][:3]]

        # S'assurer qu'on a bien 3 leurres uniques et différents de la réponse
        clean_distractors = []
        for d in distractors:
            if d.lower() != q_ref['answer'].lower() and d not in clean_distractors:
                clean_distractors.append(d)

        while len(clean_distractors) < 3:
            clean_distractors.append(f"Faux choix {len(clean_distractors)+1}")

        options = [q_ref['answer']] + clean_distractors
        random.shuffle(options)

        # Retrouver la question dans les données
        for cat, qs in data.items():
            if cat == q_ref['category']:
                for q in qs:
                    if q['id'] == q_ref['id']:
                        q['type'] = 'qcm'
                        q['options'] = options
                        processed_ids.append(q['id'])

    # Sauvegarder dans le fichier JSON d'origine
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    save_checkpoint(processed_ids)
    print(f"Lot de {len(batch)} questions converti et sauvegardé dans {filepath}.")
    return True

def main():
    processed_ids = load_checkpoint()
    files = glob.glob('src/data/*.json')
    total_processed = 0

    for filepath in files:
        if filepath.endswith('.bak') or filepath.endswith('.bak.json'):
            continue

        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                data = json.load(f)
        except Exception:
            continue

        current_batch = []
        for cat, qs in data.items():
            for q in qs:
                if (q.get('type') == 'open' or q.get('type') != 'qcm') and q['id'] not in processed_ids:
                    current_batch.append({
                        "id": q['id'],
                        "category": cat,
                        "question": q['question'],
                        "answer": q['answer']
                    })

                    if len(current_batch) >= BATCH_SIZE:
                        success = process_batch(current_batch, filepath, data, processed_ids)
                        if success:
                            total_processed += len(current_batch)
                        current_batch = []
                        time.sleep(2) # Pause pour rate limits

        if current_batch:
            success = process_batch(current_batch, filepath, data, processed_ids)
            if success:
                total_processed += len(current_batch)

    print(f"\nMigration terminée ou en pause. {total_processed} questions traitées lors de cette session.")

if __name__ == "__main__":
    main()
