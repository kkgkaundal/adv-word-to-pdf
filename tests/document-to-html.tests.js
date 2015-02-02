var assert = require("assert");
var promises = require("../lib/promises");

var mammoth = require("../lib");
var documents = require("../lib/documents");
var DocumentConverter = require("../lib/document-to-html").DocumentConverter;
var test = require("./testing").test;
var htmlPaths = require("../lib/html-paths");
var xmlreader = require("../lib/xmlreader");
var results = require("../lib/results");
var documentMatchers = require("../lib/document-matchers");


describe('DocumentConverter', function() {
    test('should empty document to empty string', function() {
        var document = new documents.Document([]);
        var converter = new DocumentConverter();
        return converter.convertToHtml(document).then(function(result) {
            assert.equal(result.value, "");
        });
    });

    test('should convert document containing one paragraph to single p element', function() {
        var document = new documents.Document([
            paragraphOfText("Hello.")
        ]);
        var converter = new DocumentConverter();
        return converter.convertToHtml(document).then(function(result) {
            assert.equal(result.value, "<p>Hello.</p>");
        });
    });

    test('ignores empty paragraphs', function() {
        var document = new documents.Document([
            paragraphOfText("")
        ]);
        var converter = new DocumentConverter();
        return converter.convertToHtml(document).then(function(result) {
            assert.equal(result.value, "");
        });
    });

    test('text is HTML-escaped', function() {
        var document = new documents.Document([
            paragraphOfText("1 < 2")
        ]);
        var converter = new DocumentConverter();
        return converter.convertToHtml(document).then(function(result) {
            assert.equal(result.value, "<p>1 &lt; 2</p>");
        });
    });

    test('should convert document containing multiple paragraphs to multiple p elements', function() {
        var document = new documents.Document([
            paragraphOfText("Hello."),
            paragraphOfText("Goodbye.")
        ]);
        var converter = new DocumentConverter();
        return converter.convertToHtml(document).then(function(result) {
            assert.equal(result.value, "<p>Hello.</p><p>Goodbye.</p>");
        });
    });

    test('uses style mappings to pick HTML element for docx paragraph', function() {
        var document = new documents.Document([
            paragraphOfText("Hello.", "Heading1", "Heading 1"),
        ]);
        var converter = new DocumentConverter({
            styleMap: [
                {
                    from: documentMatchers.paragraph({styleName: "Heading 1"}),
                    to: htmlPaths.topLevelElement("h1")
                }
            ]
        });
        return converter.convertToHtml(document).then(function(result) {
            assert.equal(result.value, "<h1>Hello.</h1>");
        });
    });

    test('can use non-default HTML element for unstyled paragraphs', function() {
        var document = new documents.Document([
            paragraphOfText("Hello.")
        ]);
        var converter = new DocumentConverter({
            styleMap: [
                {
                    from: documentMatchers.paragraph(),
                    to: htmlPaths.topLevelElement("h1")
                }
            ]
        });
        return converter.convertToHtml(document).then(function(result) {
            assert.equal(result.value, "<h1>Hello.</h1>");
        });
    });

    test('warning is emitted if paragraph style is unrecognised', function() {
        var document = new documents.Document([
            paragraphOfText("Hello.", "Heading1", "Heading 1"),
        ]);
        var converter = new DocumentConverter();
        return converter.convertToHtml(document).then(function(result) {
            assert.deepEqual(result.messages, [results.warning("Unrecognised paragraph style: 'Heading 1' (Style ID: Heading1)")]);
        });
    });

    test('can use stacked styles to generate nested HTML elements', function() {
        var document = new documents.Document([
            paragraphOfText("Hello.")
        ]);
        var converter = new DocumentConverter({
            styleMap: [
                {
                    from: documentMatchers.paragraph(),
                    to: htmlPaths.elements(["h1", "span"])
                }
            ]
        });
        return converter.convertToHtml(document).then(function(result) {
            assert.equal(result.value, "<h1><span>Hello.</span></h1>");
        });
    });

    test('bold runs are wrapped in <strong> tags', function() {
        var run = runOfText("Hello.", {isBold: true});
        var converter = new DocumentConverter();
        return converter.convertToHtml(run).then(function(result) {
            assert.equal(result.value, "<strong>Hello.</strong>");
        });
    });

    test('bold runs can exist inside other tags', function() {
        var run = new documents.Paragraph([
            runOfText("Hello.", {isBold: true})
        ]);
        var converter = new DocumentConverter();
        return converter.convertToHtml(run).then(function(result) {
            assert.equal(result.value, "<p><strong>Hello.</strong></p>");
        });
    });

    test('underline runs are ignored by default', function() {
        var run = runOfText("Hello.", {isUnderline: true});
        var converter = new DocumentConverter();
        return converter.convertToHtml(run).then(function(result) {
            assert.equal(result.value, "Hello.");
        });
    });

    test('underline runs can be wrapped in <u> tags', function() {
        var run = runOfText("Hello.", {isUnderline: true});
        var converter = new DocumentConverter({
            convertUnderline: mammoth.underline.element("u")
        });
        return converter.convertToHtml(run).then(function(result) {
            assert.equal(result.value, "<u>Hello.</u>");
        });
    });

    test('italic runs are wrapped in <em> tags', function() {
        var run = runOfText("Hello.", {isItalic: true});
        var converter = new DocumentConverter();
        return converter.convertToHtml(run).then(function(result) {
            assert.equal(result.value, "<em>Hello.</em>");
        });
    });

    test('run can be both bold and italic', function() {
        var run = runOfText("Hello.", {isBold: true, isItalic: true});
        var converter = new DocumentConverter();
        return converter.convertToHtml(run).then(function(result) {
            assert.equal(result.value, "<strong><em>Hello.</em></strong>");
        });
    });

    test('superscript runs are wrapped in <sup> tags', function() {
        var run = runOfText("Hello.", {
            verticalAlignment: documents.verticalAlignment.superscript
        });
        var converter = new DocumentConverter();
        return converter.convertToHtml(run).then(function(result) {
            assert.equal(result.value, "<sup>Hello.</sup>");
        });
    });

    test('subscript runs are wrapped in <sub> tags', function() {
        var run = runOfText("Hello.", {
            verticalAlignment: documents.verticalAlignment.subscript
        });
        var converter = new DocumentConverter();
        return converter.convertToHtml(run).then(function(result) {
            assert.equal(result.value, "<sub>Hello.</sub>");
        });
    });

    test('run styles are converted to HTML if mapping exists', function() {
        var run = runOfText("Hello.", {styleId: "Heading1Char", styleName: "Heading 1 Char"});
        var converter = new DocumentConverter({
            styleMap: [
                {
                    from: documentMatchers.run({styleName: "Heading 1 Char"}),
                    to: htmlPaths.elements(["strong"])
                }
            ]
        });
        return converter.convertToHtml(run).then(function(result) {
            assert.equal(result.value, "<strong>Hello.</strong>");
        });
    });

    test('warning is emitted if run style is unrecognised', function() {
        var run = runOfText("Hello.", {styleId: "Heading1Char", styleName: "Heading 1 Char"});
        var converter = new DocumentConverter();
        return converter.convertToHtml(run).then(function(result) {
            assert.deepEqual(result.messages, [results.warning("Unrecognised run style: 'Heading 1 Char' (Style ID: Heading1Char)")]);
        });
    });

    test('docx hyperlink is converted to <a>', function() {
        var hyperlink = new documents.Hyperlink(
            [runOfText("Hello.")],
            {href: "http://www.example.com"}
        );
        var converter = new DocumentConverter();
        return converter.convertToHtml(hyperlink).then(function(result) {
            assert.equal(result.value, '<a href="http://www.example.com">Hello.</a>');
        });
    });

    test('docx hyperlink with anchor is converted to <a>', function() {
        var hyperlink = new documents.Hyperlink(
            [runOfText("Hello.")],
            {anchor: "_Peter"}
        );
        var converter = new DocumentConverter();
        return converter.convertToHtml(hyperlink).then(function(result) {
            assert.equal(result.value, '<a href="#_Peter">Hello.</a>');
        });
    });

    test('docx tab is converted to tab in HTML', function() {
        var tab = new documents.Tab();
        var converter = new DocumentConverter();
        return converter.convertToHtml(tab).then(function(result) {
            assert.equal(result.value, "\t");
        });
    });

    test('docx table is converted to table in HTML', function() {
        var table = new documents.Table([
            new documents.TableRow([
                new documents.TableCell([paragraphOfText("Top left")]),
                new documents.TableCell([paragraphOfText("Top right")])
            ]),
            new documents.TableRow([
                new documents.TableCell([paragraphOfText("Bottom left")]),
                new documents.TableCell([paragraphOfText("Bottom right")])
            ])
        ]);
        var converter = new DocumentConverter();

        return converter.convertToHtml(table).then(function(result) {
            var expectedHtml = "<table>" +
                "<tr><td><p>Top left</p></td><td><p>Top right</p></td></tr>" +
                "<tr><td><p>Bottom left</p></td><td><p>Bottom right</p></td></tr>" +
                "</table>";
            assert.equal(result.value, expectedHtml);
        });
    });

    test('empty cells are preserved in table', function() {
        var table = new documents.Table([
            new documents.TableRow([
                new documents.TableCell([paragraphOfText("")]),
                new documents.TableCell([paragraphOfText("Top right")])
            ])
        ]);
        var converter = new DocumentConverter();

        return converter.convertToHtml(table).then(function(result) {
            var expectedHtml = "<table>" +
                "<tr><td></td><td><p>Top right</p></td></tr>" +
                "</table>";
            assert.equal(result.value, expectedHtml);
        });
    });

    test('line break is converted to <br>', function() {
        var lineBreak = new documents.LineBreak();
        var converter = new DocumentConverter();

        return converter.convertToHtml(lineBreak).then(function(result) {
            assert.equal(result.value, "<br />");
        });
    });

    test('footnote reference is converted to superscript intra-page link', function() {
        var footnoteReference = new documents.NoteReference({
            noteType: "footnote",
            noteId: "4"
        });
        var converter = new DocumentConverter({
            idPrefix: "doc-42"
        });
        return converter.convertToHtml(footnoteReference).then(function(result) {
            assert.equal(result.value, '<sup><a href="#doc-42-footnote-4" id="doc-42-footnote-ref-4">[1]</a></sup>');
        });
    });

    test('footnotes are included after the main body', function() {
        var footnoteReference = new documents.NoteReference({
            noteType: "footnote",
            noteId: "4"
        });
        var document = new documents.Document(
            [new documents.Paragraph([
                runOfText("Knock knock"),
                new documents.Run([footnoteReference])
            ])],
            {
                notes: new documents.Notes({
                    4: new documents.Note({
                        noteType: "footnote",
                        noteId: "4",
                        body: [paragraphOfText("Who's there?")]
                    })
                })
            }
        );

        var converter = new DocumentConverter({
            idPrefix: "doc-42"
        });
        return converter.convertToHtml(document).then(function(result) {
            var expectedOutput = '<p>Knock knock<sup><a href="#doc-42-footnote-4" id="doc-42-footnote-ref-4">[1]</a></sup></p>' +
                '<ol><li id="doc-42-footnote-4"><p>Who\'s there? <a href="#doc-42-footnote-ref-4">↑</a></p></li></ol>';
            assert.equal(result.value, expectedOutput);
        });
    });

    test('images are written with data URIs', function() {
        var imageBuffer = new Buffer("Not an image at all!");
        var image = new documents.Image({
            readImage: function(encoding) {
                return promises.when(imageBuffer.toString(encoding));
            },
            contentType: "image/png"
        });
        var converter = new DocumentConverter();
        return converter.convertToHtml(image).then(function(result) {
            assert.equal(result.value, '<img src="data:image/png;base64,' + imageBuffer.toString("base64") + '" />');
        });
    });

    test('images have alt attribute if available', function() {
        var imageBuffer = new Buffer("Not an image at all!");
        var image = new documents.Image({
            readImage: function() {
                return promises.when(imageBuffer);
            },
            altText: "It's a hat"
        });
        var converter = new DocumentConverter();
        return converter.convertToHtml(image)
            .then(function(result) {
                return xmlreader.read(result.value);
            })
            .then(function(htmlImageElementDocument) {
                var htmlImageElement = htmlImageElementDocument.root;
                assert.equal(htmlImageElement.attributes.alt, "It's a hat");
            });
    });

    test('can add custom handler for images', function() {
        var imageBuffer = new Buffer("Not an image at all!");
        var image = new documents.Image({
            readImage: function(encoding) {
                return promises.when(imageBuffer.toString(encoding));
            },
            contentType: "image/png"
        });
        var converter = new DocumentConverter({
            convertImage: function(element, html, messages, callback) {
                element.read("utf8").then(function(altText) {
                    html.selfClosing(htmlPaths.element("img", {alt: altText}));
                    callback();
                });
            }
        });
        return converter.convertToHtml(image).then(function(result) {
            assert.equal(result.value, '<img alt="Not an image at all!" />');
        });
    });

    test('long documents do not cause stack overflow', function() {
        var paragraphs = [];
        for (var i = 0; i < 1000; i++) {
            paragraphs.push(paragraphOfText("Hello."));
        }
        var document = new documents.Document(paragraphs);
        var converter = new DocumentConverter();
        return converter.convertToHtml(document).then(function(result) {
            assert.equal(result.value.indexOf("<p>Hello.</p>"), 0);
        });
    });

    test('referenced bookmarks are coverted to anchors', function() {
        var bookmarkStart = new documents.BookmarkStart({name: "_Peter"});
        var hyperlink = new documents.Hyperlink(
            [runOfText("Hello.")],
            {anchor: "_Peter"}
        );
        var converter = new DocumentConverter();
        var document = new documents.Document([bookmarkStart, hyperlink]);
        return converter.convertToHtml(document).then(function(result) {
            assert.equal(result.value, '<span id="_Peter"></span><a href="#_Peter">Hello.</a>');
        });
    });

    test('unreferenced bookmarks are not converted', function() {
        var bookmarkStart = new documents.BookmarkStart({name: "_Unreferenced"});
        var converter = new DocumentConverter();
        return converter.convertToHtml(bookmarkStart).then(function(result) {
            assert.equal(result.value, '');
        });
    });
});

function paragraphOfText(text, styleId, styleName) {
    var run = runOfText(text);
    return new documents.Paragraph([run], {
        styleId: styleId,
        styleName: styleName
    });
}

function runOfText(text, properties) {
    var textElement = new documents.Text(text);
    return new documents.Run([textElement], properties);
}
