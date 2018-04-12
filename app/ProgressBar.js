export default class ProgressBar {

    constructor({parentElement, label, classModifier, steps}) {
        this.parentElement = document.querySelector(parentElement);
        this.stepsTotal = steps;
        this.stepsCompleted = 0;
        this.progress = 0;
        this.label = label;
        this.classModifier = classModifier;

        this.display();
        this.refresh();
    }

    increase() {
        this.stepsCompleted++;
        this.progress = Math.min(100, this.progress + 100 / this.stepsTotal);
        this.refresh();

        if(this.stepsCompleted === this.stepsTotal) this.elements.container.classList.add('completed');
    }

    display() {
        const container = document.createElement('div');
        const bar = document.createElement('div');
        const label = document.createElement('span');

        container.classList.add("progress-bar");
        container.classList.add(this.classModifier);
        bar.classList.add('progress-bar__bar');
        label.classList.add('progress-bar__label');

        container.appendChild(bar);
        container.appendChild(label);
        this.parentElement.appendChild(container);

        this.elements = {
            container,
            bar,
            label
        };
    }

    refresh() {
        this.elements.label.innerHTML = `${this.label} <span class="progress-bar__steps">(${this.stepsCompleted}/${this.stepsTotal})</span>`;
        this.elements.bar.style.width = `${this.progress}%`;
    }

    destroy() {

    }
}