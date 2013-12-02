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
		# Save doc and cursor position on edit
		id = Session.get 'currStream'
		cur = @cm.doc.getCursor()
		if !id
			newId = @Streams.insert code: @cm.getValue(), line: cur.line, ch: cur.ch
			@router.setStream newId
		else
			@Streams.update id, code: @cm.getValue(), line: cur.line, ch: cur.ch

Template.editor.code = () ->
	# Обновление содержимого редактора. 
	# Не обновляет, если клиентский редактор — источник содержимого (он как бы уже обновлен)
	stream = @Streams.findOne _id: Session.get 'currStream'
	if stream && stream.code != @cm.getValue()
		@cm.setValue stream.code
		@cm.doc.setCursor line: stream.line, ch: stream.ch

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
	Backbone.history.start pushState: true