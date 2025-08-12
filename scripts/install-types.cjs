const { execSync } = require("child_process");
const packageJson = require("../package.json");

const dependencies = {
  ...packageJson.dependencies,
  ...packageJson.devDependencies,
};

const typesToInstall = [];

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
