var assert = require("assert");
var test = require("./testing").test;
var mdWriter = require("../lib/markdown-writer");

describe('markdown-writer', function() {
    test('can generate a paragraph', function() {
        var writer = mdWriter.writer();
        writer.open("p");
        writer.text("Hello");
        writer.close("p");
        return assert.equal(writer.asString(), "Hello\n\n");
    });

    test('can generate a level 1 heading', function() {
        var writer = mdWriter.writer();
        writer.open("h1");
        writer.text("Hello");
        writer.close("h1");
        return assert.equal(writer.asString(), "# Hello\n\n");
    });

    test('can generate a level 2 heading', function() {
        var writer = mdWriter.writer();
        writer.open("h2");
        writer.text("Hello");
        writer.close("h2");
        return assert.equal(writer.asString(), "## Hello\n\n");
    });

    test('can generate a level 3 heading', function() {
        var writer = mdWriter.writer();
        writer.open("h3");
        writer.text("Hello");
        writer.close("h3");
        return assert.equal(writer.asString(), "### Hello\n\n");
    });

    test('can generate a level 4 heading', function() {
        var writer = mdWriter.writer();
        writer.open("h4");
        writer.text("Hello");
        writer.close("h4");
        return assert.equal(writer.asString(), "#### Hello\n\n");
    });

    test('can generate a level 5 heading', function() {
        var writer = mdWriter.writer();
        writer.open("h5");
        writer.text("Hello");
        writer.close("h5");
        return assert.equal(writer.asString(), "##### Hello\n\n");
    });

    test('can generate a level 6 heading', function() {
        var writer = mdWriter.writer();
        writer.open("h6");
        writer.text("Hello");
        writer.close("h6");
        return assert.equal(writer.asString(), "###### Hello\n\n");
    });

    test('can generate a new line', function() {
        var writer = mdWriter.writer();
        writer.text("Hello World");
        writer.selfClosing("br");
        return assert.equal(writer.asString(), "Hello World  \n");
    });

    test('can generate strong text', function() {
        var writer = mdWriter.writer();
        writer.text("Hello ");
        writer.open("strong");
        writer.text("World");
        writer.close("strong");
        return assert.equal(writer.asString(), "Hello **World**");
    });
    
    test('can generate emphasis text', function() {
        var writer = mdWriter.writer();
        writer.text("Hello ");
        writer.open("em");
        writer.text("World");
        writer.close("em");
        return assert.equal(writer.asString(), "Hello *World*");
    });

    test('can generate hyperlinks', function() {
        var writer = mdWriter.writer();
        writer.open("a", { "href": "http://example.com" });
        writer.text("Hello");
        writer.close("a");
        return assert.equal(writer.asString(), "[Hello](http://example.com)");
    });

    test('can generate hyperlinks with missing href attribute', function() {
        var writer = mdWriter.writer();
        writer.open("a", {});
        writer.text("Hello");
        writer.close("a");
        return assert.equal(writer.asString(), "[Hello]()");
    });

    test('can generate hyperlinks with empty attributes', function() {
        var writer = mdWriter.writer();
        writer.open("a");
        writer.text("Hello");
        writer.close("a");
        return assert.equal(writer.asString(), "[Hello]()");
    });

    test('can generate images', function() {
        var writer = mdWriter.writer();
        writer.selfClosing("img", { "src": "http://example.com/image.jpg", "alt": "Alt Text" });
        return assert.equal(writer.asString(), "[Alt Text](http://example.com/image.jpg)");
    });

    test('can generate images with missing alt attribute', function() {
        var writer = mdWriter.writer();
        writer.selfClosing("img", { "src": "http://example.com/image.jpg" });
        return assert.equal(writer.asString(), "[](http://example.com/image.jpg)");
    });

    test('can generate images with misssing src attribute', function() {
        var writer = mdWriter.writer();
        writer.selfClosing("img", { "alt": "Alt Text" });
        return assert.equal(writer.asString(), "[Alt Text]()");
    });

    test("doesn't display empty images", function() {
        var writer = mdWriter.writer();
        writer.selfClosing("img");
        return assert.equal(writer.asString(), "");
    });

    test('can generate an ordered list', function() {
        var writer = mdWriter.writer();
        writer.open("ol");
        writer.open("li");
        writer.text("Hello");
        writer.close("li");
        writer.open("li");
        writer.text("World");
        writer.close("li");
        writer.close("ol");
        return assert.equal(writer.asString(), "1. Hello\n2. World\n\n");
    });

    test('can generate an unordered list', function() {
        var writer = mdWriter.writer();
        writer.open("ul");
        writer.open("li");
        writer.text("Hello");
        writer.close("li");
        writer.open("li");
        writer.text("World");
        writer.close("li");
        writer.close("ul");
        return assert.equal(writer.asString(), "- Hello\n- World\n\n");
    });

    test('can generate a nested ordered list with correct numbering', function() {
        var writer = mdWriter.writer();
        writer.open("ol");
        writer.open("li");
        writer.text("Outer One");
        writer.close("li");
        writer.open("li");
        writer.text("Outer Two");

        writer.open("ol");
        writer.open("li");
        writer.text("Nested One");
        writer.close("li");
        writer.open("li");
        writer.text("Nested Two");
        writer.close("li");
        writer.open("li");
        writer.text("Nested Three");
        writer.close("li");
        writer.close("ol");

        writer.close("li");
        writer.open("li");
        writer.text("Outer Three");
        writer.close("li");
        writer.close("ol");
        return assert.equal(writer.asString(), "1. Outer One\n2. Outer Two\n\t1. Nested One\n\t2. Nested Two\n\t3. Nested Three\n3. Outer Three\n\n");
    });

    test('can generate a multi-level nested ordered list with correct numbering', function() {
        var writer = mdWriter.writer();
        writer.open("ol");
        writer.open("li");
        writer.text("Outer One");
        writer.close("li");
        writer.open("li");
        writer.text("Outer Two");

        writer.open("ol");
        writer.open("li");
        writer.text("Nested One");
        writer.close("li");
        writer.open("li");
        writer.text("Nested Two");
        writer.close("li");
        writer.open("li");
        writer.text("Nested Three");

        writer.open("ol");
        writer.open("li");
        writer.text("Inner One");
        writer.close("li");
        writer.open("li");
        writer.text("Inner Two");
        writer.close("li");
        writer.open("li");
        writer.text("Inner Three");
        writer.close("li");
        writer.open("li");
        writer.text("Inner Four");
        writer.close("li");
        writer.close("ol");

        writer.close("li");
        writer.open("li");
        writer.text("Nested Four");
        writer.close("li");
        writer.close("ol");

        writer.close("li");
        writer.open("li");
        writer.text("Outer Three");
        writer.close("li");
        writer.close("ol");
        return assert.equal(writer.asString(), "1. Outer One\n2. Outer Two\n\t1. Nested One\n\t2. Nested Two\n\t3. Nested Three\n\t\t1. Inner One\n\t\t2. Inner Two\n\t\t3. Inner Three\n\t\t4. Inner Four\n\t4. Nested Four\n3. Outer Three\n\n");
    });

    test('can generate sequential ordered lists with correct numbering', function() {
        var writer = mdWriter.writer();
        writer.open("ol");
        writer.open("li");
        writer.text("First One");
        writer.close("li");
        writer.open("li");
        writer.text("First Two");
        writer.close("li");
        writer.close("ol");

        writer.open("ol");
        writer.open("li");
        writer.text("Second One");
        writer.close("li");
        writer.open("li");
        writer.text("Second Two");
        writer.close("li");
        writer.open("li");
        writer.text("Second Three");
        writer.close("li");
        writer.close("ol");

        return assert.equal(writer.asString(), "1. First One\n2. First Two\n\n1. Second One\n2. Second Two\n3. Second Three\n\n");
    });

    test('can generate a nested unordered list', function() {
        var writer = mdWriter.writer();
        writer.open("ul");
        writer.open("li");
        writer.text("Outer One");
        writer.close("li");
        writer.open("li");
        writer.text("Outer Two");

        writer.open("ul");
        writer.open("li");
        writer.text("Nested One");
        writer.close("li");
        writer.open("li");
        writer.text("Nested Two");
        writer.close("li");
        writer.open("li");
        writer.text("Nested Three");
        writer.close("li");
        writer.close("ul");

        writer.close("li");
        writer.open("li");
        writer.text("Outer Three");
        writer.close("li");
        writer.close("ul");
        return assert.equal(writer.asString(), "- Outer One\n- Outer Two\n\t- Nested One\n\t- Nested Two\n\t- Nested Three\n- Outer Three\n\n");
    });

    test('can nest inline elements', function() {
        var writer = mdWriter.writer();
        writer.open("p");
        writer.text("Lorem ");
        writer.open("strong");
        writer.text("ipsum ");
        writer.open("em");
        writer.text("dolor");
        writer.close("em");
        writer.text(" sit");
        writer.close("strong");
        writer.text(" amet");
        writer.close("p");
        return assert.equal(writer.asString(), "Lorem **ipsum *dolor* sit** amet\n\n");
    });

    test('can emphasise list text', function() {
        var writer = mdWriter.writer();
        writer.open("ol");
        writer.open("li");
        writer.text("Hello ");
        writer.open("strong");
        writer.text("Strong");
        writer.close("strong");
        writer.text(" World");
        writer.close("li");
        writer.open("li");
        writer.text("Hello ");
        writer.open("em");
        writer.text("Emphasis");
        writer.close("em");
        writer.text(" World");
        writer.close("li");
        writer.close("ol");
        return assert.equal(writer.asString(), "1. Hello **Strong** World\n2. Hello *Emphasis* World\n\n");
    });

    test('blank paragraphs are removed', function() {
        var writer = mdWriter.writer();
        writer.open("p");
        writer.text("Hello");
        writer.close("p");
        writer.open("p");
        writer.text("");
        writer.close("p");
        writer.open("p");
        writer.text("");
        writer.close("p");
        writer.open("p");
        writer.text("World");
        writer.close("p");
        return assert.equal(writer.asString(), "Hello\n\nWorld\n\n");
    });

    test('generates correct spacing between paragraphs and lists', function() {
        var writer = mdWriter.writer();
        writer.open("p");
        writer.text("Hello World");
        writer.close("p");
        writer.open("ul");
        writer.open("li");
        writer.text("First Item");
        writer.close("li");
        writer.open("li");
        writer.text("Second Item");
        writer.close("li");
        writer.close("ul");
        writer.open("p");
        writer.text("Hello World");
        writer.close("p");
        return assert.equal(writer.asString(), "Hello World\n\n- First Item\n- Second Item\n\nHello World\n\n");
    });
});
