var configs = {
    development: {
        db: {
            connectionLimit: 100,
            host: 'localhost',
            user: 'root',
            password: 'rats',
            database: 'coredb',
            debug: false
        },
        leaderMinionPort: 8001,
        trainingScheduleStrategy: "force",
        minionCreateStrategy: "force"
    }, production: {
        db: {
            connectionLimit: 100,
            host: 'localhost',
            user: 'root',
            password: 'rats',
            database: 'coredb',
            debug: false
        },
        leaderMinionPort: 8001,
        trainingScheduleStrategy: "force",
        minionCreateStrategy: "bestfit"
    },
};


module.exports = configs;