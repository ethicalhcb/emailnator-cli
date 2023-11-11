#!/bin/bash
# This script is used to deploy the package to GitHub and NPM registry
# codingben bs.7416@proton.me

set -e

# Check if jq is installed, otherwise install it
if ! command -v jq &> /dev/null
then
        sudo apt install jq
fi

# Function to compare versions
function version_gt() { test "$(printf '%s\n' "$@" | sort -V | head -n 1)" != "$1"; }

# Check if an argument has been passed
if [ $# -eq 0 ]
    then
        echo "No argument provided. Please provide the version."
        exit 1
fi

# Define the version
VERSION=$1

# Read the current version from version.json
CURRENT_VERSION=$(jq -r '.version' version.json)

# Check if the $VERSION is > to in .version && package.json
if version_gt $VERSION $CURRENT_VERSION; then
    # Ask for confirmation before modifying files
    read -p "Update the current version to $VERSION?. Do you want to continue? (y/n) " choice
    case "$choice" in
        y|Y )
            # Modify the package.json file
            jq '.version = "'$VERSION'"' package.json > temp.json && mv temp.json package.json

            # Modify the version.json file
            jq '.version = "'$VERSION'"' version.json > temp.json && mv temp.json version.json

            # Display modifications
            echo "Version changed to $VERSION in package.json and version.json"

            # Ask for confirmation before executing modifications
            read -p "Do you want continu deployment to GitHub and NPM ? (y/n) " choice
            case "$choice" in
                y|Y )
                    # Execute modifications
                    # Create a commit
                    git add .
                    git commit -m "Update version to $VERSION"

                    # Push to GitHub
                    git push

                    # Do an npm publish
                    npm publish

                    # Display a report
                    echo "Production deployment completed. Version $VERSION published ✨"
                    ;;
                n|N ) echo "Modifications cancelled.";;
                * ) echo "Invalid response.";;
            esac
            ;;
        n|N ) echo "Modifications cancelled." && exit 1;;
        * ) echo "Invalid response." && exit 1;;
    esac
else
    echo "The version $VERSION is less than the current version."
    exit 1
fi