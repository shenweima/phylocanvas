//var newickToJSON = require('../newick');

/*
 * GET home page.
 */

exports.index = function(req, res) {

    //var newickTree = '((((((((((((Dictyostelium_discoideum_AX4:0.135321,(Arabidopsis_thaliana:0.133291,Trypanosoma_brucei_TREU927:0.322284)0.929:0.085387)0.366:0.029332,(((Anopheles:0.239676,Strongylocentrotus_purpuratus:0.150801)0.345:0.032971,Homo_sapiens:0.065764)0.860:0.035397,Caenorhabditis_elegans:0.274418)0.095:0.033594)0.972:0.123288,Schizosaccharomyces_pombe_972h:0.095490)0.382:0.054524,Ustilago_maydis_521:0.123910)0.668:0.073076,Plasmodium_chabaudi:0.372515)0.879:0.151089,ESV-Virus87_Ectocarpus_siliculosus_virus:0.668368)0.601:0.043068,MIMIVIRUS:0.822743)0.889:0.158980,(((MethanospirillumEuryarchaeota_hungatei:0.315324,MethanosarcinaEuryarchaeota_acetivorans_C2A:0.240795)0.285:0.094176,(HalobacteriumEuryarchaeota:0.195689,HaloarculaEuryarchaeota_marismortui_ATCC_43049:0.127464)0.442:0.101325)0.914:0.150726,MethanosphaeraEuryarchaeota_stadtmanae_DSM_3091:0.372786)0.748000:0.083016)0.000:0.026256,PhageSPM2:1.312830)1.000:0.937702,AquifexBacteria_aeolicus_VF5:0.320951)0.040:0.069294,PolaribacterBacteria_irgensii:0.320210)0.930:0.164752,NeisseriaBacteria_meningitidis:0.440821,EhrlichiaBacteria_ruminantium:0.394994);';
    //var jsonTree = newickToJSON.parse(newickTree);

    console.log(appConfig.client);

    res.render('index', {
    	//tree: jsonTree,
    	appConfig: JSON.stringify(appConfig.client)
    });

    // http://test.mlst.net/PhyloCanvas/blockDemoEARSS.html
    // http://test.mlst.net/PhyloCanvas/PhyloCanvas.js
    // http://raphaeljs.com/
    // http://coding.smashingmagazine.com/2013/10/29/get-up-running-grunt/
};

// Return representative tree metadata
exports.getRepresentativeTreeMetadata = function(req, res) {
	console.log('[WGST] Getting representative tree metadata');

	// Get requested assembly from db
	var couchbase = require('couchbase');
	var db = new couchbase.Connection({
		host: 'http://129.31.26.151:8091/pools',
		bucket: 'test_wgst_resources',
		password: '.oneir66'
	}, function(err) {
		if (err) throw err;

		db.get('REP_METADATA_1280', function(err, results) {

			if (err) throw err;

			console.log('[WGST] Got representative tree metadata');

			res.json(results);
		});
	});
};