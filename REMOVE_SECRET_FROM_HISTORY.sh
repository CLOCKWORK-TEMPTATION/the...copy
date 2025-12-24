#!/bin/bash
# Script to remove exposed GitHub token from git history
#
# WARNING: This will rewrite git history. All collaborators will need to re-clone
# or run: git fetch --all && git reset --hard origin/main
#
# The token that needs to be removed:
# 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

echo "=== GitHub Secret Removal Script ==="
echo ""
echo "This script will remove the exposed GitHub token from git history."
echo "IMPORTANT: The token should be revoked on GitHub immediately!"
echo ""
echo "Visit: https://github.com/settings/tokens"
echo "And revoke the token: ghp_N2mmspQ4SZHRIDELUp49JZqw1sr..."
echo ""

# Option 1: Using BFG Repo-Cleaner (Recommended)
echo "=== Option 1: Using BFG Repo-Cleaner (Recommended) ==="
echo ""
echo "1. Download BFG from: https://rtyley.github.io/bfg-repo-cleaner/"
echo ""
echo "2. Create a file called 'passwords.txt' with the token:"
echo "   echo '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' > passwords.txt"
echo ""
echo "3. Run BFG:"
echo "   java -jar bfg.jar --replace-text passwords.txt"
echo ""
echo "4. Clean up and force push:"
echo "   git reflog expire --expire=now --all && git gc --prune=now --aggressive"
echo "   git push --force"
echo ""

# Option 2: Using git filter-repo (Alternative)
echo "=== Option 2: Using git filter-repo ==="
echo ""
echo "1. Install git-filter-repo:"
echo "   pip install git-filter-repo"
echo ""
echo "2. Create replacement file:"
cat << 'EOF'
   echo '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==>***TOKEN_REMOVED***' > replacements.txt
EOF
echo ""
echo "3. Run filter-repo:"
echo "   git filter-repo --replace-text replacements.txt --force"
echo ""
echo "4. Re-add remote and force push:"
echo "   git remote add origin https://github.com/CLOCKWORK-TEMPTATION/the...copy.git"
echo "   git push --force --set-upstream origin main"
echo ""

# Option 3: Allow the secret through GitHub (Not Recommended)
echo "=== Option 3: Allow through GitHub (NOT RECOMMENDED) ==="
echo ""
echo "Only use this if you've already revoked the token and understand the risks."
echo "Visit: https://github.com/CLOCKWORK-TEMPTATION/the...copy/security/secret-scanning/unblock-secret/37JOdqbCRTHfhoWv4tNJsSQSgQL"
echo ""
echo "This will allow the push but the token remains in history."
echo ""

echo "=== After fixing, inform all collaborators to: ==="
echo "   git fetch --all"
echo "   git reset --hard origin/main"
echo ""
