AppRouter = Backbone.Router.extend
	routes:
		'': 'main',
		':id': 'open'

	main: () ->
		Session.set 'currStream', null
		console.log 'main action'

	open: (id) ->
		Session.set 'currStream', id
		Streams.findOne _id: id

	setStream: (id) ->
		this.navigate id, trigger: true

$(document).ready () =>
	@cm = CodeMirror.fromTextArea(
		document.getElementById('editor'),
		mode: 'javascript'
		indentUnit: 2
		indentWithTabs: true
		lineNumbers: true
	)

	@cm.on 'change', (evt) =>
		id = Session.get 'currStream'
		cur = @cm.doc.getCursor()
		if !id
			newId = @Streams.insert code: @cm.getValue(), line: cur.line, ch: cur.ch, patches: []
			stream = @Streams.findOne _id: newId
			@router.setStream newId
		else
			stream = @Streams.findOne _id: id
			if stream
				res = ''
				res = stream.code if stream.code != undefined
				diff = @dmp.diff_main res, @cm.getValue()
				patch = @dmp.patch_make res, @cm.getValue(), diff
				Meteor.call('addPatch', id, patch)

Template.editor.code = () ->
	stream = @Streams.findOne _id: Session.get 'currStream'
	if stream && stream.code
		pos = @cm.doc.getCursor()
		newpos = pos
		@cm.setValue stream.code
		@cm.doc.setCursor newpos

Template.editor.theme = () ->
	if @cm
		theme = 'twilight'
		theme = 'default' if Session.get('theme') == 'light'
		@cm.setOption 'theme', theme


dark = () ->
	return true if Session.get('theme') == 'dark'
	return false

Template.header.dark = dark

Template.menu.dark = dark

Template.menu.events
	'click .theme-switcher': (evt) =>
		evt.preventDefault()
		switcher = $ evt.currentTarget
		if switcher.hasClass 'st-light'
			theme = 'light'
		else
			theme = 'dark'
		Session.set 'theme', theme


Meteor.startup () =>
	Session.setDefault 'theme', 'dark'
	Meteor.call 'setTheme', 'dark'
	@router = new AppRouter()
	@dmp = new diff_match_patch()
	Backbone.history.start pushState: true