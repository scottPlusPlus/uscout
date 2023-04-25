import { CSS_CLASSES } from '~/code/front/CssClasses';
import { Item } from '~/models/item.server';


type TagObj = {
    name: string,
    count: number
}

export default function TagCloud(props: { items: Item[], onTagClick: (arg0: string) => void }) {
    const tagCountMap = new Map<string, TagObj>();

    props.items.forEach((item) => {
        item.tags.forEach((tag) => {
            const obj = tagCountMap.get(tag) || { name: tag, count: 0 };
            obj.count += 1;
            tagCountMap.set(tag, obj);
        });
    });

    const tagObjs = Array.from(tagCountMap.values())
        .sort((a, b) => { return b.count - a.count });

    return (
        <div>
            {tagObjs.map(tag => (
                <button key={tag.name}
                    onClick={() => { props.onTagClick(tag.name) }}
                    className={CSS_CLASSES.ITEM_TAG}>
                    {tag.name} | {tag.count}
                </button>
            ))}
        </div>
    )
}