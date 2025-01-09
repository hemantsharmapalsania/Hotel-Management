const app = require("./app/app.js")
const sequelize = require('./app/config/database');
const config = require("./app/config/config.js")

sequelize.sync().then(() => {
    app.listen(config.PORT, () => {
        console.log(`Server running on port ${config.PORT}`);
    });
}).catch(err => console.log("Database is not connected" + err));