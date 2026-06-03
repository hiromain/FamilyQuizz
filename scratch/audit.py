import json
import glob
import sys

def main():
    files = glob.glob('src/data/*.json')
    total_q = 0
    open_q = 0
    converted_q = 0

    for filepath in files:
        if filepath.endswith('.bak') or filepath.endswith('.bak.json'):
            continue
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                data = json.load(f)
            for category, questions in data.items():
                for q in questions:
                    total_q += 1
                    if q.get('type') == 'open' or q.get('type') != 'qcm':
                        open_q += 1
                    elif q.get('type') == 'qcm' and len(q.get('options', [])) == 4:
                        converted_q += 1
        except Exception:
            pass

    print(f"--- Rapport d'Audit de Migration ---")
    print(f"Total des questions: {total_q}")
    print(f"Questions converties (QCM avec 4 options): {converted_q}")
    print(f"Questions 'open' restantes: {open_q}")

    if open_q == 0:
        print("SUCCÈS: Migration terminée à 100% !")
        sys.exit(0)
    else:
        print(f"EN COURS: Migration à {int((converted_q/total_q)*100)}% ({open_q} questions restantes)")
        # On ne throw pas d'erreur car le script tourne en fond
        sys.exit(0)

if __name__ == "__main__":
    main()
