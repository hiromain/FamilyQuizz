# 🚀 Prompt de Migration Autonome pour Jules (jules.google.com)

Copiez-collez l'intégralité de ce prompt dans **Jules** pour démarrer automatiquement la migration de vos 1 900 questions ouvertes en QCM.

---

```markdown
Bonjour Jules,

Tu es un développeur et data auditor autonome de génie. Ta mission aujourd'hui est d'effectuer une migration de données majeure sur notre projet de quiz familial : **convertir l'intégralité des questions ouvertes en QCM à 4 propositions**.

Notre base de données de questions est stockée sous forme de fichiers JSON situés dans le dossier `src/data/`. Il y a environ 1 900 questions ouvertes réparties sur 16 fichiers JSON.

Voici tes consignes impératives pour mener à bien cette mission de manière autonome :

### 1. Analyse et Planification
- Parcours le dossier `src/data/` pour identifier tous les fichiers `.json` actifs (exclure les fichiers `.bak`).
- Charge et analyse chaque fichier JSON. Les fichiers ont une structure où les clés représentent les catégories/sous-catégories (par exemple : `"Géographie : Pays & Capitales"`), et les valeurs sont des listes d'objets questions.
- Identifie toutes les questions ayant un attribut `"type"` égal à `"open"` (ou différent de `"qcm"`).

### 2. Algorithme de conversion QCM par IA
Pour CHAQUE question ouverte identifiée :
1. Analyse la question originale (`"question"`) et la réponse exacte (`"answer"`).
2. Utilise tes capacités de raisonnement LLM intégrées pour générer **exactement 3 fausses réponses (leurres / distracteurs) crédibles** :
   - Les leurres doivent être pertinents, de même nature grammaticale que la bonne réponse, et ne pas prêter à confusion.
   - Les leurres doivent être rédigés dans un français impeccable et respecter le niveau de difficulté original de la question (`"difficulty"`).
   - Les leurres ne doivent pas être synonymes ou s'apparenter à une réponse exacte alternative.
3. Crée un tableau `"options"` contenant la réponse exacte (`"answer"`) et les 3 leurres générés.
4. **Mélange de manière aléatoire** l'ordre des éléments dans ce tableau `"options"`.
5. Modifie l'objet question pour :
   - Ajouter le champ `"options"` contenant ton tableau mélangé de 4 chaînes de caractères.
   - Changer la valeur de `"type"` à `"qcm"`.
6. Conserve tous les autres attributs originaux de la question intacts (comme `id`, `difficulty`, `explanation`, etc.).

### 3. Exécution Résiliente et Validation
- Effectue la conversion de manière progressive pour chaque fichier JSON.
- Écris et exécute un script de validation Python à la fin de la migration pour certifier que :
  - Tous les fichiers JSON sont syntaxiquement parfaits et bien formatés.
  - Le nombre final de questions ayant `"type": "open"` ou différent de `"qcm"` dans tout le projet est égal à **ZÉRO**.
  - Toutes les questions ont désormais un attribut `"options"` de taille **exactement égale à 4**.
- S'il y a la moindre anomalie, corrige-la immédiatement.

### 4. Commits et Livraison
- Réalise des commits clairs et progressifs pour chaque fichier converti (ex: `feat(data): convert open questions to QCM in history`).
- Une fois que toutes les validations sont au vert, pousse directement les modifications ou crée une Pull Request sur notre dépôt GitHub.

Démarre la mission dès maintenant et convertis ces 1 900 questions de manière autonome !
```
