const { app } = require("./app");
const PORT = process.env.PORT || 3009;

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
