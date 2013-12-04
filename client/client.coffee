AppRouter = Backbone.Router.extend
	routes:
		'': 'main',
		':id': 'open'

	main: () ->
		Session.set 'currStream', null
		console.log 'main action'

	open: (id) ->
		Session.set 'currStream', id

	setStream: (id) ->
		this.navigate id, trigger: true

currUTCTime = () ->
	d = new Date()
	d.getTime() - d.getTimezoneOffset() * 60

$(document).ready () =>
	
	@cm = CodeMirror.fromTextArea(
		document.getElementById('editor'),
		mode: 'javascript'
		content: 'd'
		indentUnit: 2
		indentWithTabs: true
		lineNumbers: true
	)

	@cm.on 'beforeChange', (cm, changeObj) ->
		# opts.cancel() 
	@cm.on 'change', (cm, changeObj) ->
		if changeObj.origin != "setValue"
			cur = @cm.doc.getCursor()
			id = Session.get 'currStream'
			if !id
				Meteor.call 'addStream', @cm.getValue(), currUTCTime(), (err, res) =>
					console.log err, res
					@router.setStream res
			else
				@Versions.insert
					stream_id: id
					code: @cm.getValue()
					time: currUTCTime()
				Meteor.call 'updateStreamCode', id

Template.editor.code = () ->
	stream = @Streams.findOne _id: Session.get 'currStream'
	if stream && stream.cache
		dmp = new diff_match_patch()
		pos = @cm.doc.getCursor()
		newpos = pos

		@cm.setValue stream.cache

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