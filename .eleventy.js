module.exports = function(eleventyConfig) {
  // Zkopírovat obrázky
  eleventyConfig.addPassthroughCopy("images");

  // Zkopírovat CSS
  eleventyConfig.addPassthroughCopy("css");

  // Zkopírovat JS
  eleventyConfig.addPassthroughCopy("js");

  //fonty
  eleventyConfig.addPassthroughCopy("assets");

  // Zkopírovat favicony
  eleventyConfig.addPassthroughCopy("favicon*");

  // Kolekce všech projektů (HTML i NJK) ze složky portfolio
  eleventyConfig.addCollection("projects", (collectionApi) => {
    return collectionApi.getFilteredByGlob("./portfolio/*.{html,njk}");
  });

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


