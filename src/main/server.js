const app = require("./app");
const PORT = process.env.PORT || 2000;

app.listen(PORT, function () {
    Logger.info("App started on port %s", PORT);
});


module.exports = app;
