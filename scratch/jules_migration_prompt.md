# 🚀 Prompt de Migration Autonome de Questions pour Jules (jules.google.com)

Copiez-collez l'intégralité de ce prompt dans **Jules** pour démarrer une nouvelle conversation propre et exécuter la migration de manière stable et incrémentale.

---

```markdown
Bonjour Jules,

Tu es un développeur et data auditor autonome de génie. Ta mission aujourd'hui est d'effectuer une migration de données majeure sur notre projet de quiz familial : **convertir l'intégralité des questions ouvertes en QCM à 4 propositions**.

Notre base de données de questions est stockée sous forme de fichiers JSON situés dans le dossier `src/data/`. Il y a environ 1 900 questions ouvertes (où `"type"` est différent de `"qcm"`) réparties sur 16 fichiers JSON.

Pour mener à bien cette mission sans surcharger ton contexte et éviter tout timeout ou refus lié au grand volume de données, tu dois **automatiser le processus en écrivant et en exécutant un script de migration Python incrémental**.

Voici ta feuille de route impérative et structurée pour réaliser cette tâche de manière autonome et sécurisée :

### 🛠️ Étape 1 : Écrire un script Python de migration (`scratch/migrate_to_qcm.py`)
Rédige un script Python robuste qui fera le gros du travail. Le script doit :
1. **Identifier les cibles :** Scanner les 16 fichiers JSON sous `src/data/` (exclure les fichiers `.bak`).
2. **Utiliser un mécanisme de Checkpoint :**
   - Créer un fichier de statut `scratch/migration_checkpoint.json` pour enregistrer l'ID de chaque question déjà convertie.
   - Si le script est interrompu ou relancé, il doit lire ce fichier et ignorer instantanément les questions déjà traitées.
3. **Appeler l'API de génération (Gemini ou autre LLM disponible dans ton environnement) :**
   - Rédige une fonction python qui envoie un prompt à l'API LLM pour lui demander de générer exactement 3 fausses réponses (leurres / distracteurs) crédibles pour une question et sa réponse correcte.
   - *Exemple de prompt LLM interne au script :*
     "Pour la question : '{question}' et sa réponse correcte : '{answer}', génère uniquement un tableau JSON de 3 fausses réponses (leurres) crédibles, en français, de même nature grammaticale, non ambiguës et sans répéter la bonne réponse."
4. **Restructurer la question :**
   - Fusionner la bonne réponse et les 3 leurres dans un tableau `"options"` et le mélanger aléatoirement.
   - Modifier `"type"` à `"qcm"`.
   - Sauvegarder les modifications dans le fichier JSON d'origine après chaque lot ou chaque fichier traité pour sécuriser les données.

### 📦 Étape 2 : Traiter les fichiers par petits lots (Batching)
- Ne traite pas les 1 900 questions d'un coup. Configure ton script pour traiter les questions par **lots de 50 à 100 questions** à la fois.
- Marque des pauses de quelques secondes entre les lots pour respecter les limites de requêtes par minute (Rate Limits) de l'API LLM.

### 🧪 Étape 3 : Exécuter et Valider
1. Exécute le script `migrate_to_qcm.py` depuis ton terminal. Tu peux le lancer plusieurs fois de suite si nécessaire grâce au système de checkpoint.
2. Écris et lance un script d'audit final pour valider :
   - Qu'il reste exactement 0 question de type `"open"` dans tous les fichiers JSON.
   - Que toutes les questions possèdent bien un tableau `"options"` de taille 4.
   - Que le format JSON de chaque fichier est parfaitement intègre.

### 🚀 Étape 4 : Commit et Pull Request
- Réalise des commits réguliers (par exemple, fichier par fichier ou lot par lot).
- Pousse toutes tes modifications sur notre dépôt GitHub.

Démarre l'écriture du script `scratch/migrate_to_qcm.py` dès maintenant, lance l'exécution par lots et convertis ces questions de manière stable !
```
