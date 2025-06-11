import { FileView, TFile, WorkspaceLeaf, Plugin } from "obsidian";

export const VIEW_TYPE_TAB = "tab-view";

import * as alphaTab from '@coderline/alphatab';
import convert from "color-convert";

export type AlphaTabResources = {
    bravuraUri: string;
    alphaTabWorkerUri: string;
    soundFontData: Uint8Array;
}

export class TabView extends FileView {
    private static instanceId = 0;
    private _api!: alphaTab.AlphaTabApi;
    private _styles: HTMLStyleElement;

    constructor(leaf: WorkspaceLeaf, private plugin: Plugin, private resources: AlphaTabResources) {
        super(leaf);
    }

    getViewType(): string {
        return VIEW_TYPE_TAB;
    }

    getDisplayText(): string {
        return 'alphaTab';
    }

    onload(): void {
        const cls = `alphatab-${TabView.instanceId++}`;

        const styles = this.containerEl.createEl('style');
        styles.innerHTML = `
        .${cls} .at-cursor-bar {
            background: hsl(var(--accent-h),var(--accent-s),var(--accent-l));
            opacity: 0.2
        }

        .${cls} .at-selection div {
            background: hsl(var(--accent-h),var(--accent-s),var(--accent-l));
            opacity: 0.4
        }

        .${cls} .at-cursor-beat {
            background: hsl(var(--accent-h),var(--accent-s),var(--accent-l));
            width: 3px;
        }

        .${cls} .at-highlight * {
            fill: hsl(var(--accent-h),var(--accent-s),var(--accent-l));
            stroke: hsl(var(--accent-h),var(--accent-s),var(--accent-l));
        }
        `;
        this._styles = styles;


        const toolbar = this.contentEl.createDiv();
        const playPause = toolbar.createEl('button');
        playPause.innerText = 'Play/Pause';
        playPause.onclick = ()=>{
            this._api.playPause();
        };
        
        const element = this.contentEl.createDiv({ cls: cls });
        const style = window.getComputedStyle(element);

        const api = new alphaTab.AlphaTabApi(element, {
            core: {
                // we can use the plugin file as worker entry point as we import alphaTab into this file here
                // this will initialize whatever is needed.
                scriptFile: this.resources.alphaTabWorkerUri,
                smuflFontSources: new Map<alphaTab.FontFileFormat, string>([
                    [alphaTab.FontFileFormat.Woff2, this.resources.bravuraUri]
                ])
            },
            player: {
                playerMode: alphaTab.PlayerMode.EnabledAutomatic
            },
            display: {
                resources: {
                    // set theme colors
                    mainGlyphColor: style.getPropertyValue('--color-base-100'),
                    secondaryGlyphColor: style.getPropertyValue('--color-base-60'),
                    staffLineColor: style.getPropertyValue('--color-base-40'),
                    barSeparatorColor: style.getPropertyValue('--color-base-40'),
                    barNumberColor: '#' + convert.hsl.hex([
                        parseFloat(style.getPropertyValue('--accent-h')),
                        parseFloat(style.getPropertyValue('--accent-s')),
                        parseFloat(style.getPropertyValue('--accent-l'))
                    ]),
                    scoreInfoColor: style.getPropertyValue('--color-base-100'),
                }
            }
        });
        this._api = api;
    }

    onunload(): void {
        this._api.destroy();
    }

    async onLoadFile(file: TFile): Promise<void> {
        this._api.loadSoundFont(new Uint8Array(this.resources.soundFontData));

        const inputFile = await this.app.vault.readBinary(file);
        this._api.load(new Uint8Array(inputFile));
    }
}