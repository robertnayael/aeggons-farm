export default class Score {

    constructor({collectibleTypes, initialLives, sprites}) {
        this.lives = initialLives;
        this.collectibleTypes = collectibleTypes;
        this.collectibles = [];
        this.sprites = sprites;

        // TODO: move this to an external file
        this.appearance = {
            position: {
                x: 1300,
                y: 0
            },
            itemGroupWidth: 300,
            font: {
                type: "Bangers",
                size: 50,
                color: "#fff",
                borderWidth: 2,
                borderColor: "#000"
            }
        }
    }

    update(currentLives, collectibles) {
        this.lives = currentLives;

        this.collectibles = Object.entries(this.collectibleTypes).map(([type, properties]) => {
            if (collectibles.some(collectible => collectible.type === type)) {
                return {
                    type,
                    showTotal: properties.showTotal,
                    requiredToWin: properties.requiredToWin,
                    total: collectibles.filter(collectible => collectible.type === type).length,
                    score: collectibles.filter(collectible => collectible.type === type && collectible.collected === true).length
                };
            }
        });
    }

    isEnoughToWin() {
        return true;
    }

    getScoreForDisplay() {
        // score regular collectibles
        const score = this.collectibles.reduce((score, item) => {
            if (item && item.total > 0) {
                score.push([
                    this.getSprite(item.type),
                    this.getText(`${item.score}/${item.total}`)
                ]);
            }
            return score;
        }, []);

        // number of lives
        score.push([
            this.getText('lives:'),
            ...Array(this.lives).fill(this.getSprite('life'))
        ]);

        return {
            itemGroups: score,
            groupWidth: this.appearance.itemGroupWidth,
            position: this.appearance.position
        };
    }

    getText(content) {
        const textStyle = this.getTextStyle();
        return {
            type: 'text',
            ...textStyle,
            content
        };
    }

    getSprite(type) {
        return {
            type: "sprite",
            ...this.sprites.getSprite(['score', type])
        };
    }

    getTextStyle() {
        const {font} = this.appearance;
        return {
            font: `${font.size}px ${font.type}`,
            lineWidth: font.borderWidth,
            fillStyle: font.color,
            strokeStyle: font.borderColor,
        };
    }

}