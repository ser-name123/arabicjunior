import {
    AlignCenter,
    AlignLeft,
    AlignRight,
    Bold,
    Heading1,
    Heading2,
    Heading3,
    Highlighter,
    Italic,
    LinkIcon,
    List,
    ListOrdered,
    Palette,
    Strikethrough,
} from "lucide-react";
import { Toggle } from "../ui/toggle";
import { Editor } from "@tiptap/react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { useEffect, useState } from "react";
import { Input } from "../ui/input-2";

export default function MenuBar({ editor }: { editor: Editor | null }) {
    const [color, setColor] = useState("#000000");

    if (!editor) {
        return null;
    }

    useEffect(() => {
        if (!editor) return;

        const updateColor = () => {
            const currentColor = editor.getAttributes("textStyle").color || "#000000";
            setColor(currentColor);
        };

        // Run once initially
        updateColor();

        // Update on every selection change
        editor.on("selectionUpdate", updateColor);
        editor.on("transaction", updateColor); // also catches formatting changes

        return () => {
            editor.off("selectionUpdate", updateColor);
            editor.off("transaction", updateColor);
        };
    }, [editor]);
    const addLink = () => {
        const previousUrl = editor.getAttributes("link").href;
        const url = window.prompt("Enter a URL", previousUrl);

        if (url === null) {
            return;
        }
        if (url === "") {
            editor.chain().focus().unsetLink().run();
            return;
        }

        editor.chain().focus().setLink({ href: url }).run();
    };

    const applyColor = (newColor: string) => {
        setColor(newColor);
        editor.chain().focus().setColor(newColor).run();
    };

    const Options = [
        {
            icon: <Heading1 className="size-4" />,
            onClick: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
            preesed: editor.isActive("heading", { level: 1 }),
        },
        {
            icon: <Heading2 className="size-4" />,
            onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
            preesed: editor.isActive("heading", { level: 2 }),
        },
        {
            icon: <Heading3 className="size-4" />,
            onClick: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
            preesed: editor.isActive("heading", { level: 3 }),
        },
        {
            icon: <Bold className="size-4" />,
            onClick: () => editor.chain().focus().toggleBold().run(),
            preesed: editor.isActive("bold"),
        },
        {
            icon: <Italic className="size-4" />,
            onClick: () => editor.chain().focus().toggleItalic().run(),
            preesed: editor.isActive("italic"),
        },
        {
            custom: true, // 👈 mark this as special
        },
        {
            icon: <Strikethrough className="size-4" />,
            onClick: () => editor.chain().focus().toggleStrike().run(),
            preesed: editor.isActive("strike"),
        },
        {
            icon: <LinkIcon className="size-4" />,
            onClick: addLink,
            preesed: editor.isActive("link"),
        },
        {
            icon: <AlignLeft className="size-4" />,
            onClick: () => editor.chain().focus().setTextAlign("left").run(),
            preesed: editor.isActive({ textAlign: "left" }),
        },
        {
            icon: <AlignCenter className="size-4" />,
            onClick: () => editor.chain().focus().setTextAlign("center").run(),
            preesed: editor.isActive({ textAlign: "center" }),
        },
        {
            icon: <AlignRight className="size-4" />,
            onClick: () => editor.chain().focus().setTextAlign("right").run(),
            preesed: editor.isActive({ textAlign: "right" }),
        },
        {
            icon: <List className="size-4" />,
            onClick: () => editor.chain().focus().toggleBulletList().run(),
            preesed: editor.isActive("bulletList"),
        },
        {
            icon: <ListOrdered className="size-4" />,
            onClick: () => editor.chain().focus().toggleOrderedList().run(),
            preesed: editor.isActive("orderedList"),
        },
        {
            icon: <Highlighter className="size-4" />,
            onClick: () => editor.chain().focus().toggleHighlight().run(),
            preesed: editor.isActive("highlight"),
        },
    ];

    return (
        <div className="border rounded-md p-1 mb-1 bg-white space-x-2 z-50">
            {Options.map((option, index) =>
                option.custom ? (
                    <Popover key={index}>
                        <PopoverTrigger asChild>
                            <Toggle size="sm" pressed={false}>
                                <Palette className="size-4" />
                            </Toggle>
                        </PopoverTrigger>
                        <PopoverContent className="w-32 p-2">
                            <Input
                                type="color"
                                value={color}
                                onChange={(e) => applyColor(e.target.value)}
                                className="w-full h-8 cursor-pointer border rounded"
                            />
                        </PopoverContent>
                    </Popover>
                ) : (
                    <Toggle
                        key={index}
                        size="sm"
                        pressed={option.preesed}
                        onPressedChange={option.onClick}
                    >
                        {option.icon}
                    </Toggle>
                )
            )}

        </div>
    );
}