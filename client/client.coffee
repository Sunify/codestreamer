AppRouter = Backbone.Router.extend
	routes:
		'': 'main',
		':id': 'open'

	main: () =>
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
		theme: 'twilight'
		indentUnit: 2
		indentWithTabs: true
		lineNumbers: true
	)

	@cm.on 'change', (evt) =>
		id = Session.get 'currStream'
		console.log @cm.doc.getCursor()
		if !id
			cur = @cm.doc.getCursor()
			newId = @Streams.insert code: @cm.getValue(), line: cur.line, ch: cur.ch
			@router.setStream newId
		else
			@Streams.update id, code: @cm.getValue()

Template.editor.code = () ->
	stream = @Streams.findOne _id: Session.get 'currStream'
	if stream && stream.code != @cm.getValue()
		@cm.setValue stream.code
		@cm.doc.setCursor line: stream.line, ch: stream.ch


Meteor.startup () =>
	@router = new AppRouter()
	Backbone.history.start pushState: true