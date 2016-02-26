var cledit = window.cledit($('pre').get(0), $('pre').parent().get(0))

var prismGrammar = window.mdGrammar({
	fences: true,
	tables: true,
	footnotes: true,
	abbrs: true,
	deflists: true,
	tocs: true,
	dels: true,
	subs: true,
	sups: true,
})
cledit.init({
	highlighter: function(text) {
		return window.Prism.highlight(text, prismGrammar)
	},
	// Optional (increases performance on large documents)
	sectionParser: function(text) {
		var offset = 0, sectionList = []
		;(text + '\n\n').replace(/^.+[ \t]*\n=+[ \t]*\n+|^.+[ \t]*\n-+[ \t]*\n+|^\#{1,6}[ \t]*.+?[ \t]*\#*\n+/gm, function(match, matchOffset) {
			sectionList.push(text.substring(offset, matchOffset))
			offset = matchOffset
		})
		sectionList.push(text.substring(offset))
		return sectionList
	}
})