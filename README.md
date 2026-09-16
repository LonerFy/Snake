# Neon Snake

Snake en TypeScript, thème néon/cyberpunk : bords traversables, vitesse qui augmente à chaque fruit, meilleur score sauvegardé dans le navigateur.

## Structure

```
neon-snake/
├── index.html          page principale
├── style.css           thème visuel
├── src/game.ts          code source TypeScript
├── dist/game.js          version compilée, chargée par index.html
├── tsconfig.json
├── package.json
└── .github/workflows/deploy.yml   déploiement automatique (optionnel)
```

## Lancer en local

```bash
npm install
npm run build      # compile src/game.ts vers dist/game.js
```

Puis ouvre `index.html` dans un navigateur, ou sers le dossier avec un petit serveur local (ex. `npx serve .`) si tu préfères éviter les restrictions de `file://`.

Pendant le développement, `npm run watch` recompile automatiquement à chaque modification de `src/game.ts`.

## Déployer sur GitHub Pages

**Option simple (recommandée pour commencer) :**

1. Crée un dépôt GitHub et pousse tout le contenu de ce dossier, en gardant bien `dist/game.js` à jour (lance `npm run build` avant chaque `git push` si tu as modifié `src/game.ts`).
2. Dans les paramètres du dépôt : `Settings` → `Pages` → `Source: Deploy from a branch` → branche `main`, dossier `/ (root)`.
3. Le site sera disponible à `https://<ton-pseudo-github>.github.io/<nom-du-depot>/`.

**Option automatisée :**

Le fichier `.github/workflows/deploy.yml` est déjà inclus. Si tu préfères ne jamais avoir à recompiler manuellement :

1. Dans `Settings` → `Pages`, choisis `Source: GitHub Actions` au lieu de `Deploy from a branch`.
2. À chaque push sur `main`, GitHub Actions compile `src/game.ts` et publie automatiquement le site.

## Commandes

- Flèches ou WASD : diriger le serpent
- Espace : pause
- Boutons à l'écran : contrôle tactile sur mobile

## Personnaliser

Les constantes en haut de `src/game.ts` (`COLS`, `ROWS`, `CELL`, `START_SPEED_MS`, `MIN_SPEED_MS`, `SPEED_STEP_MS`, `POINTS_PER_FOOD`) contrôlent la taille de la grille, la vitesse de départ et sa progression.
