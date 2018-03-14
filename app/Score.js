export default class Score {

    constructor({collectibleTypes, initialLives, sprites}) {
        this.lives = initialLives;
        this.collectibleTypes = collectibleTypes;
        this.collectibles = [];
        this.sprites = sprites;
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

    getSprites() {
        return [];
    }
}