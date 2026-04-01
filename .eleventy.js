module.exports = function(eleventyConfig) {
  // --- STATICKÉ SOUBORY (Passthrough Copy) ---

  // Obrázky, CSS a JS (i cookieconsent.css/js)
  eleventyConfig.addPassthroughCopy("images");
  eleventyConfig.addPassthroughCopy("css");
  eleventyConfig.addPassthroughCopy("js");

  // Fonty a ostatní assets 
  eleventyConfig.addPassthroughCopy("assets");

  // Favicony (hvězdička pokryje favicon.ico, favicon-32x32.png atd.)
  eleventyConfig.addPassthroughCopy("favicon*");
  eleventyConfig.addPassthroughCopy("apple-icon*"); 

  // --- KOLEKCE ---
  
  eleventyConfig.addCollection("projects", (collectionApi) => {
    return collectionApi.getFilteredByGlob("./portfolio/*.{html,njk}");
  });

  // --- NASTAVENÍ ADRESÁŘŮ ---

  return {
    templateFormats: ["njk", "html", "md"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    dataTemplateEngine: "njk",
    dir: {
      input: ".",         
      includes: "_includes",
      output: "dist", 
    },
  };
};

