"use client";

import { EditorContent, useEditor, useEditorState } from '@tiptap/react'
import StarterKit from "@tiptap/starter-kit";
import React, { useEffect, useState } from "react";
import MenuBar from "./menu-bar";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import Heading from "@tiptap/extension-heading";
import Underline from '@tiptap/extension-underline'
import { TextStyleKit } from '@tiptap/extension-text-style'

interface RichTextEditorProps {
    content: string;
    onChange: (html: string, text: string) => void;
}
export default function RichTextEditor({
    content,
    onChange,
}: RichTextEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                hardBreak: false,
                bulletList: {
                    HTMLAttributes: {
                        class: "list-disc ml-3",
                    },
                },
                orderedList: {
                    HTMLAttributes: {
                        class: "list-decimal ml-3",
                    },
                },
            }),
            // HardBreak.extend({
            //     addKeyboardShortcuts() {
            //         return {
            //             Enter: () => this.editor.commands.splitBlock(),
            //         };
            //     },
            // }),
            TextAlign.configure({
                types: ["heading", "paragraph"],
            }),
            Heading.configure({
                levels: [1, 2, 3],
            }),
            Highlight,
            Underline,
            TextStyleKit
        ],
        content: content,

        immediatelyRender: false,
        editorProps: {
            attributes: {
                class: "min-h-[606px] border rounded-md bg-white py-2 px-3",
            },
        },
        onUpdate: ({ editor }) => {
            const html = editor.getHTML();
            const text = editor.getText();
            onChange(html, text);

        },
    });

    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
        if (editor && content && !initialized) {
            editor.commands.setContent(content);
            setInitialized(true);
        }
    }, [editor, content, initialized]);

    // const editor = useEditor({
    //     extensions: [StarterKit],
    //     content,
    //     immediatelyRender: false,
    //     onUpdate: ({ editor }) => {
    //         onChange(editor.getHTML(), editor.getHTML())
    //     },
    // })

    if (!editor) return null; // avoid rendering before editor mounts

    return (
        <div>
            <MenuBar editor={editor} />
            <EditorContent editor={editor} />
        </div>
    );
}