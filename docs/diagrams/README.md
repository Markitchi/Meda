# Génération de Diagrammes PDF - Meda

Ce dossier contient les fichiers source Mermaid (.mmd) pour tous les diagrammes du projet.

## Installation de Mermaid CLI

```powershell
npm install -g @mermaid-js/mermaid-cli
```

## Génération des PDFs

### Méthode 1: Script automatique
```powershell
.\generate-diagrams.ps1
```

### Méthode 2: Génération manuelle
```powershell
# Un seul diagramme
mmdc -i docs\diagrams\01-use-case.mmd -o docs\diagrams\pdf\01-use-case.pdf

# Tous les diagrammes
Get-ChildItem docs\diagrams\*.mmd | ForEach-Object {
    $output = $_.FullName -replace '\.mmd$', '.pdf' -replace '\\diagrams\\', '\diagrams\pdf\'
    mmdc -i $_.FullName -o $output -b transparent
}
```

## Liste des Diagrammes

1. **01-use-case.mmd** - Diagramme de cas d'utilisation
2. **02-class-diagram.mmd** - Diagramme de classes
3. **03-erd.mmd** - Diagramme entité-relation
4. **04-sequence.mmd** - Diagramme de séquence (Diagnostic IA)
5. **05-activity.mmd** - Diagramme d'activité (Workflow)
6. **06-components.mmd** - Diagramme de composants
7. **07-deployment.mmd** - Diagramme de déploiement

## Options Mermaid CLI

```powershell
# Fond transparent
mmdc -i input.mmd -o output.pdf -b transparent

# Thème spécifique
mmdc -i input.mmd -o output.pdf -t dark

# Taille personnalisée
mmdc -i input.mmd -o output.pdf -w 1920 -H 1080

# Format PNG au lieu de PDF
mmdc -i input.mmd -o output.png
```

## Résolution des problèmes

Si mmdc n'est pas reconnu après l'installation:
1. Fermer et rouvrir le terminal
2. Vérifier le PATH: `npm config get prefix`
3. Réinstaller: `npm install -g @mermaid-js/mermaid-cli --force`
