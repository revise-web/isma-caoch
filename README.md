# Muscu Coach — PWA
PWA d'entraînement (checklist, chrono, stats) faite pour Ismael.

## Installation iPhone (iOS 16+)
1. Héberge ces fichiers (voir **Déploiement** ci-dessous).
2. Ouvre l'URL dans **Safari** sur ton iPhone.
3. Tap sur **Partager** → **Ajouter à l’écran d’accueil**.
4. Lance l’app depuis l’icône. Autorise les **notifications** si tu veux les rappels.

## Déploiement ultra simple
### Option A — GitHub Pages (gratuit)
1. Crée un repo sur GitHub appelé `muscu-coach`.
2. Glisse **tous les fichiers** du dossier dans le repo et *Commit*.
3. Dans *Settings → Pages* : *Build and deployment* → *Deploy from branch*, branche `main`, dossier `/root`.
4. Ton site sera disponible à une URL du type : `https://<ton-user>.github.io/muscu-coach/`.
5. Ouvre cette URL sur iPhone et **Ajouter à l’écran d’accueil**.

### Option B — Netlify (1 minute)
1. Va sur https://app.netlify.com/ → **New site from Git** ou **Drag & Drop** le dossier zip décompressé.
2. Netlify te donne une URL `https://xxxx.netlify.app` directement.

## Fonctionnalités
- Checklist des exercices par jour (programme pré-rempli)
- Chronomètre + compte à rebours repos
- Stats (séances faites, streak)
- Sauvegarde locale + export/import JSON
- Offline (Service Worker)
- Rappel quotidien (limité par iOS pour PWA)

## Modifier le programme
Édite `app.js` → tableau `DEFAULT_PLAN`.

---
Généré le 2025-08-14.
