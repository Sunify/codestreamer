Meteor.methods({

	addPatch: function(streamId, patch) {
		var stream, dmp, code;

		if(patch[0] !== undefined) {
			stream = Streams.findOne({_id: streamId});
			dmp = new diff_match_patch();
			code = dmp.patch_apply(patch, stream.code);
			Streams.update(
				streamId,
				{
					code: code[0],
				}
			);
		}
	},

	addStream: function(code, time) {
		var id;

		id = Streams.insert({code: '', cache: ''});

		Meteor.call('addVersion', id, code, time);
		Meteor.call('updateStreamCode', id);

		return id;
	},

	computeCache: function(history, src, remove){
		var dmp, res_code;
		if(remove === undefined) remove = false;

		dmp = new diff_match_patch();
		res_code = [src];

		history.forEach(function(hitem) {
			var diff, patch;

			diff = dmp.diff_main(res_code[0], hitem.code);
			patch = dmp.patch_make(res_code[0], hitem.code, diff);
			res_code = dmp.patch_apply(patch, res_code[0]);

			if(remove) {
				Versions.remove({_id: hitem._id});
			}
		});

		return res_code[0];
	},

	cleanHistory: function(streamId) {
		var history, total, selector, opts, stream;

		history = Versions.find({stream_id: streamId});
		total = history.count();

		if(total > 200) {

			stream = Streams.findOne({_id: streamId});
			history = Versions.find(
				{
					stream_id: streamId
				},
				{
					time: 1,
					limit: total - 200
				}
			);

			Meteor.call(
				'computeCache',
				history, 
				stream.code,
				true,
				function(err, res) {
					stream.code = res
				}
			);

		}
	},

	updateStreamCode: function(streamId) {
		var stream, history;

		stream = Streams.findOne({_id: streamId});
		history = Versions.find(
			{
				stream_id: streamId
			},
			{
				time: 1
			}
		);
		console.log('history', streamId, history.count());

		Meteor.call(
			'computeCache',
			history,
			stream.code,
			function(err, res) {
				stream.cache = res;
				Streams.update(streamId, stream);
				Meteor.call('cleanHistory', streamId);
			}
		);
	},

	addVersion: function(streamId, version, time) {
		Meteor.call('updateStreamCode', streamId);
	}

});