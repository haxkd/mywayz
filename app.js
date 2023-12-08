const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;
const links = [];

// Function to scrape links from the given websites
async function scrapeLinks() {
  const url = "https://diversetile.blogspot.com/";
  const response = await axios.get(url);
  const $ = cheerio.load(response.data);
  $("a").each((index, element) => {
    const href = $(element).attr("href");
    if (href && href.startsWith("https://diversetile.blogspot.com/")) {
      if (!links.includes(href)) {
        links.push(href);
        links.push("http://google.com/search?q=" + href);
      }
      if (href.endsWith(".html") ) {
        var modifiedX = href.replace(/[.:\/-]/g, " ");
        var hrefs = "http://google.com/search?q=" + modifiedX+" site:diversetile.blogspot.com"
        if(!links.includes(hrefs)){          
          links.push(hrefs);
        }
      }
    }
  });
  return links;
}

// Endpoint to generate and save links in a JSON file of links
app.get("/generate-links", async (req, res) => {
  try {
    const links = await scrapeLinks();
    fs.writeFileSync(
      path.join(__dirname, "links.json"),
      JSON.stringify(links, null, 2)
    );
    res.json({
      success: true,
      message: "Links generated and saved.",
      links: links,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Error generating links." });
  }
});

// Endpoint to randomly redirect to one of the generated links
app.get("/", (req, res) => {
  try {
    const links = JSON.parse(
      fs.readFileSync(path.join(__dirname, "links.json"))
    );
    const randomIndex = Math.floor(Math.random() * links.length);
    const randomLink = links[randomIndex];
    res.redirect(randomLink);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
