Meteor.methods
	addPatch: (streamId, patch) =>
		stream = @Streams.findOne _id: streamId
		if patch[0]
			dmp = new diff_match_patch()
			code = dmp.patch_apply patch, stream.code
			@Streams.update streamId, code: code[0], stOffsetX: 10, stOffsetY: 0, offsetX: 5, offsetY: 1

	addStream: (code, time) =>
		id = @Streams.insert
			code: ''
			cache: ''
		
		Meteor.call 'addVersion', id, code, time
		Meteor.call 'updateStreamCode', id

		return id

	computeCache: (history, src, remove = false) ->
		dmp = new diff_match_patch()
		res_code = [src]
		# prev_time = 0
		history.forEach (hitem) ->
			# console.log hitem.time > prev_time, hitem.code
			prev_time = hitem.time
			diff = dmp.diff_main res_code[0], hitem.code
			patch = dmp.patch_make res_code[0], hitem.code, diff
			res_code = dmp.patch_apply patch, res_code[0]
			@Versions.remove _id: hitem._id if remove

		res_code[0]

	cleanHistory: (streamId) =>
		history = @Versions.find stream_id: streamId
		total = history.count()

		console.log 'total', streamId, total
		if total > 200
			stream = @Streams.findOne _id: streamId
			selector = 
				stream_id: streamId
			opts =
				time: 1
				limit: total - 200
			history = @Versions.find selector, opts
			stream.code = Meteor.call 'computeCache', history, stream.code, true

	updateStreamCode: (streamId) =>
		stream = @Streams.findOne _id: streamId

		selector = 
			stream_id: streamId
		opts =
			time: 1
		history = @Versions.find selector, opts
		console.log 'history', streamId, history.count()

		stream.cache = Meteor.call 'computeCache', history, stream.code

		@Streams.update streamId, stream
		Meteor.call 'cleanHistory', streamId

	addVersion: (streamId, version, time) =>
		Meteor.call 'updateStreamCode', streamId

