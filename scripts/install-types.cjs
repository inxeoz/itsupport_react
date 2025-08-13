const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const packageJson = require("../package.json");

const dependencies = {
  ...packageJson.dependencies,
  ...packageJson.devDependencies,
};

const typesToInstall = [];

// Function to recursively find all TypeScript/JavaScript files
function findSourceFiles(dir, extensions = [".ts", ".tsx", ".js", ".jsx"]) {
  const files = [];
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (
      stat.isDirectory() &&
      !item.startsWith(".") &&
      item !== "node_modules" &&
      item !== "dist"
    ) {
      files.push(...findSourceFiles(fullPath, extensions));
    } else if (stat.isFile() && extensions.some((ext) => item.endsWith(ext))) {
      files.push(fullPath);
    }
  }

  return files;
}

// Function to fix versioned imports in a file
function fixVersionedImports(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  // Regex to match versioned imports: package@version
  const versionedImportRegex = /from\s+["']([^"']+)@(\d+\.\d+\.\d+[^"']*)["']/g;

  let hasChanges = false;
  const updatedContent = content.replace(
    versionedImportRegex,
    (match, packageName, version) => {
      console.log(
        `Fixing versioned import: ${packageName}@${version} -> ${packageName}`,
      );
      hasChanges = true;
      return `from "${packageName}"`;
    },
  );

  if (hasChanges) {
    fs.writeFileSync(filePath, updatedContent, "utf8");
    console.log(`Fixed versioned imports in: ${filePath}`);
  }
}

// Install type definitions
Object.keys(dependencies).forEach((pkg) => {
  // Skip packages that already have types or are @types packages
  if (!pkg.startsWith("@types/") && !pkg.includes("types")) {
    try {
      // Check if @types package exists
      execSync(`npm view @types/${pkg}`, { stdio: "ignore" });
      typesToInstall.push(`@types/${pkg}`);
    } catch (e) {
      // @types package doesn't exist
      console.log(`No types available for ${pkg}`);
    }
  }
});

if (typesToInstall.length > 0) {
  console.log("Installing types:", typesToInstall);
  execSync(`npm install --save-dev ${typesToInstall.join(" ")}`, {
    stdio: "inherit",
  });
}

// Fix versioned imports in all source files
console.log("\nFixing versioned imports...");
const projectRoot = path.dirname(__dirname); // Go up one level from scripts folder
const sourceFiles = findSourceFiles(path.join(projectRoot, "src"));

sourceFiles.forEach((filePath) => {
  fixVersionedImports(filePath);
});

console.log("Done! Fixed versioned imports and installed type definitions.");
