# 🚀 Prompt d'Expansion de Contenu pour Jules (jules.google.com)

Copiez-collez l'intégralité de ce prompt dans **Jules** pour lui déléguer de manière autonome l'ajout de centaines de questions dans votre base de données.

---

```markdown
Bonjour Jules,

Tu es un développeur et historien de génie. Ta mission aujourd'hui est d'effectuer une expansion massive de notre base de données de quiz familiaux dans le dossier `src/data/`.

Voici tes deux objectifs principaux :

### 🎯 Objectif 1 : Ajouter 10 questions à chaque catégorie/sous-catégorie existante
1. Parcours l'ensemble des fichiers JSON dans `src/data/` (exclus les fichiers `.bak`).
2. Pour chaque fichier, repère toutes les clés (qui représentent les sous-catégories, comme `"Géographie : Pays & Capitales"` ou `"Sports mécaniques : Formule 1"`).
3. Ajoute exactement **10 nouvelles questions** inédites de type **QCM** à chacune de ces listes.
4. Pour chaque nouvelle question :
   - Assure-toi que la structure est parfaite : `id`, `type` (toujours `"qcm"`), `difficulty` (mélange équilibré de Facile, Moyen, Difficile), `question`, `options` (exactement 4 choix), `answer` (qui correspond textuellement à une option), et `explanation` (anecdote enrichissante).
   - Génère des identifiants uniques séquentiels basés sur le préfixe existant (ex : si le max existant est `cinema_acteurs_12`, continue avec `cinema_acteurs_13` jusqu'à `22`).
   - Rédige du contenu de haute qualité, amusant et adapté à un public familial francophone.

### 🎯 Objectif 2 : Expansion de la catégorie "Époques" (Années 1914 à 1938)
Dans le fichier `src/data/epoques.json`, les questions sont regroupées sous la clé unique `"annees"`. 
Nous voulons couvrir en profondeur l'entre-deux-guerres et le début du XXe siècle.
1. Ajoute pour **chaque année** de la période **1914 à 1938 incluse** (1914, 1915, 1916..., 1938) exactement **20 questions de type QCM** historiques spécifiques à cette année précise.
2. Pour chaque question ajoutée :
   - `"type"` : `"qcm"`.
   - `"year"` : l'entier correspondant (ex : `1914`).
   - `"id"` : sous le format `annees_<annee>_<index>` (ex : `annees_1914_2`, en reprenant après les questions déjà existantes pour cette année-là).
   - Rédige des questions captivantes sur des faits historiques majeurs, des découvertes scientifiques, des sorties de films/livres cultes, ou des événements marquants de l'année en question.
   - Fournis exactement 4 options de réponse, avec la réponse exacte et une explication claire et culturelle en français.

### 3. Exécution et Contrôle Qualité
- Effectue le travail de génération de façon progressive et résiliente.
- Une fois les questions ajoutées, écris et exécute un script de validation Python pour garantir :
  - Que tous les fichiers JSON sont syntaxiquement valides et exempts de doublons.
  - Que chaque QCM possède exactement 4 options.
  - Que les identifiants générés sont uniques.
- Valide que le code du projet compile toujours parfaitement.
- Fais des commits clairs et pousse le tout sur notre dépôt GitHub.

Démarre dès maintenant cette expansion majeure de contenu de manière autonome !
```
