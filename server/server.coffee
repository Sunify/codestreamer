Meteor.methods
	addPatch: (streamId, patch) =>
		stream = @Streams.findOne _id: streamId
		if patch[0]
			dmp = new diff_match_patch()
			code = dmp.patch_apply patch, stream.code
			@Streams.update streamId, code: code[0], stOffsetX: 10, stOffsetY: 0, offsetX: 5, offsetY: 1