import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { ContextMenuService, MenuItem } from 'primeng/api';
import { ContextMenu } from 'primeng/contextmenu';

export interface TREE {
    collapsedIcon: string;
    data: string;
    expandedIcon: string;
    id: any;
    key: string;
    label: string;
    parent_id: number;
    styleClass: string;
    expanded: boolean;
    children: TREE[];
    icon: string;
    height?: string;
    comment?: boolean;
    kyhieu?: string;
    parent?: TREE;
    read_only?: boolean;
    trangthai_baocao?: number; // done
    slug?: string;
    parent_folder?: string;
    breadCrumb?: any;
    upload?: boolean;
}

@Component({
    selector: 'tree-custom',
    templateUrl: './tree-custom.component.html',
    styleUrls: ['./tree-custom.component.css'],
    providers: [ContextMenuService]
})

export class TreeCustomComponent implements OnInit, OnChanges {

    @Input() data: TREE[] = [];

    @Input() select: TREE;

    @Input() contextMenuItems: MenuItem[];

    @Input() contextMenu = false;

    @Output() selectNode = new EventEmitter<TREE>();

    @Output() closeAndOpenNode = new EventEmitter<TREE>();

    data_tree: TREE[];

    select_tree: TREE;



    constructor() { }

    ngOnChanges(changes: SimpleChanges): void {

        if (changes['data']) {
            this.data_tree = this.data;
        }

        if (changes['select']) {
            this.select_tree = this.select
        }
    }

    ngOnInit(): void {

    }

    closeAndOpen(node: TREE) {
        node.expanded = !node.expanded;
        this.closeAndOpenNode.emit(node);
    }

    onSelectNode(node: TREE, parent: TREE) {
        if (parent)
            node['parent'] = parent;
        this.selectNode.emit(node);
    }

    onShowContext(cm: ContextMenu, event: MouseEvent, node: TREE, parent: TREE) {
        if (this.contextMenu && node.parent_id !== null) {
            cm.show(event);
            event.stopPropagation();
            this.onSelectNode(node, parent);
        }
    }
}
