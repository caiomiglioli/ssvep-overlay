const fs = require("fs");
const path = require("path");

const modulesPath = path.join(__dirname, "..", "..", "modules");

// Função para listar módulos e carregar configs
function getModules() {
  const result = [];

  // Verifica se a pasta modules existe
  if (!fs.existsSync(modulesPath)) {
    console.warn("Pasta 'modules' não encontrada.");
    return result;
  }

  // Lista as subpastas dentro de 'modules'
  const categories = fs.readdirSync(modulesPath, { withFileTypes: true });

  categories.forEach((category) => {
    if (category.isDirectory()) {
      const categoryPath = path.join(modulesPath, category.name);

      // Lista os módulos dentro de cada categoria
      const modules = fs.readdirSync(categoryPath, { withFileTypes: true });

      modules.forEach((module) => {
        if (module.isDirectory()) {
          const modulePath = path.join(categoryPath, module.name);
          const configPath = path.join(modulePath, "config.json");

          // Verifica se o módulo tem um arquivo config.json
          if (fs.existsSync(configPath)) {
            try {
              const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
              result.push({
                category: category.name,
                name: module.name,
                config,
              });
            } catch (error) {
              console.error(`Erro ao carregar o config.json de ${module.name}:`, error);
            }
          }
        }
      });
    }
  });

  return result;
}

module.exports = { getModules };
