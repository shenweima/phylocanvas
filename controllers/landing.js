exports.landing = function(req, res) {

    //var newickTree = '((((((((((((Dictyostelium_discoideum_AX4:0.135321,(Arabidopsis_thaliana:0.133291,Trypanosoma_brucei_TREU927:0.322284)0.929:0.085387)0.366:0.029332,(((Anopheles:0.239676,Strongylocentrotus_purpuratus:0.150801)0.345:0.032971,Homo_sapiens:0.065764)0.860:0.035397,Caenorhabditis_elegans:0.274418)0.095:0.033594)0.972:0.123288,Schizosaccharomyces_pombe_972h:0.095490)0.382:0.054524,Ustilago_maydis_521:0.123910)0.668:0.073076,Plasmodium_chabaudi:0.372515)0.879:0.151089,ESV-Virus87_Ectocarpus_siliculosus_virus:0.668368)0.601:0.043068,MIMIVIRUS:0.822743)0.889:0.158980,(((MethanospirillumEuryarchaeota_hungatei:0.315324,MethanosarcinaEuryarchaeota_acetivorans_C2A:0.240795)0.285:0.094176,(HalobacteriumEuryarchaeota:0.195689,HaloarculaEuryarchaeota_marismortui_ATCC_43049:0.127464)0.442:0.101325)0.914:0.150726,MethanosphaeraEuryarchaeota_stadtmanae_DSM_3091:0.372786)0.748000:0.083016)0.000:0.026256,PhageSPM2:1.312830)1.000:0.937702,AquifexBacteria_aeolicus_VF5:0.320951)0.040:0.069294,PolaribacterBacteria_irgensii:0.320210)0.930:0.164752,NeisseriaBacteria_meningitidis:0.440821,EhrlichiaBacteria_ruminantium:0.394994);';
    //var jsonTree = newickToJSON.parse(newickTree);

    console.log(appConfig.client);

    res.render('landing', {
    	//tree: jsonTree,
    	appConfig: JSON.stringify(appConfig.client)
    });

    // http://test.mlst.net/PhyloCanvas/blockDemoEARSS.html
    // http://test.mlst.net/PhyloCanvas/PhyloCanvas.js
    // http://raphaeljs.com/
    // http://coding.smashingmagazine.com/2013/10/29/get-up-running-grunt/
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