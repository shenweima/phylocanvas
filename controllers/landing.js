exports.landing = function(req, res) {
    res.render('landing', {
    	appConfig: JSON.stringify(appConfig.client)
    });
};

exports.feedback = function(req, res) {
    console.log('[WGST] Received feedback:');
    console.dir(req.body);

    var feedback = {
        name: req.body.name,
        email: req.body.email,
        feedback: req.body.feedback
    };

    //
    // Insert feedback into Couchbase
    //
    var feedbackKey = 'FEEDBACK_' + uuid.v4();

    console.log('[WGST][Couchbase] Inserting feedback with key: ' + feedbackKey);
    console.dir(feedback);

    couchbaseDatabaseConnections[COUCHBASE_BUCKETS.FEEDBACK].set(feedbackKey, feedback, function(err, result) {
        if (err) {
            console.error('[WGST][Couchbase][Error] ✗ ' + err);
            res.status(500).json({ error: 'Could not save provided feedback' });
            return;
        }

        console.log('[WGST][Couchbase] Inserted feedback');

        res.json({});
    });
};

exports.subscribe = function(req, res) {
    console.log('[WGST] Received subscription:');
    console.dir(req.body);

    var subscription = {
        email: req.body.email
    };

    //
    // Validate
    //
    if (typeof subscription.email === 'undefined' || subscription.email === '') {
        console.error('[WGST][Validation][Error] ✗ No email');
        res.status(500).json({ error: 'No email address were provided' });
        return;
    }

    //
    // Sanitize
    //
    subscription.email = subscription.email.toLowerCase();

    //
    // Insert subscription into Couchbase
    //
    var subscriptionKey = 'SUBSCRIBE_' + subscription.email;

    console.log('[WGST][Couchbase] Inserting subscription with key: ' + subscriptionKey);
    console.dir(subscription);

    couchbaseDatabaseConnections[COUCHBASE_BUCKETS.FEEDBACK].set(subscriptionKey, subscription, function(err, result) {
        if (err) {
            console.error('[WGST][Couchbase][Error] ✗ ' + err);
            res.status(500).json({ error: 'Could not insert subscription' });
            return;
        }

        console.log('[WGST][Couchbase] Inserted subscription');

        res.json({});
    });
};