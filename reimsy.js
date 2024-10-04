"use strict";

Array.prototype.pushArray = function(secondArray) {
    secondArray.forEach(item => {
        this.push(item);
    });
};

const ReimSY = (function() {

    class ReimSY {

        static PHRASETYPES = [
            ["und-wenn", ReimSY.checkEqual],
            ["wenn", ReimSY.checkGreaterThanZero],
            ["zähle-wenn", ReimSY.justCount],
            ["oder-wenn", ReimSY.onlyOne]
        ];

        static checkEqual(cluster, childrenLength) {
            return cluster.targetNumber === childrenLength;
        }

        static checkGreaterThanZero(cluster, childrenLength) {
            return cluster.targetNumber > 0;
        }

        static justCount(cluster, childrenLength) {
            return childrenLength;
        }

        static onlyOne(cluster, childrenLength) {
            return cluster.targetNumber === 1;
        }

        static isNumber(value, commaAsDecimal = false) {

            if (typeof value !== 'string') {
                return false;
            }

            const decimalSeparator = commaAsDecimal ? ',' : '.';


            const normalizedValue = value.replace(',', '.');


            return !isNaN(Number(normalizedValue));

        }

        static filterUniqueSubarrays(array1, array2) {
            return array2.filter(subArray2 =>
                !array1.some(subArray1 =>
                    JSON.stringify(subArray1) === JSON.stringify(subArray2)
                )
            );
        }


        static processHash(value, hashtable) {
            let hash = JSON.stringify(value);
            if (!hashtable.has(hash)) {
                hashtable.add(hash);
                return true;
            }
            return false;
        }

        constructor() {

            this.sentenceFinder = new PhraseFinder();
            this.phraseFinder = new PhraseFinder();
            this.sentences = [];
            this.sentenceBatch = [];
            this.allValidFormulas = [];
            this.output = [];
            this.inputHashtable = new Set();
            this.outputHashtable = new Set();
            this.numberOfLoops = 5;
        }

        add(words) {

            if (ReimSY.processHash(words, this.inputHashtable)) {


                const firstPhraseRoot = words.slice(0, 3);

                let sentence = this.sentenceFinder.getValues(firstPhraseRoot, false)[0];

                if (!sentence) {

                    sentence = new Sentence(firstPhraseRoot, this.phraseFinder);

                    this.sentences.push(sentence);
                    this.sentenceBatch.push(sentence);


                    this.sentenceFinder.addStringArray(firstPhraseRoot, sentence);

                }

                if (words.length === 3 && sentence) {

                    //sentence.phraseGroups = {};
                }

                for (let i = 3; i < words.length; i += 4) {
                    const content = words.slice(i, i + 4);
                    const phrase = new Phrase(content);

                    sentence.addChild(phrase)

                    this.phraseFinder.addStringArray(content, phrase);
                }

            } else {
                // already there
            }

        }

        addBatch(arrays) {

            arrays.forEach(array => this.add(array));

        }

        synthesize() {
            this.sentenceBatch.forEach(sentence => sentence.synthesize());
        }

        clusterize() {
            while (this.sentenceBatch.length > 0) {
                let sentence = this.sentenceBatch.shift();
                sentence.clusterize();
            }
        }

        evaluate() {

            for (let i = 0; i < this.numberOfLoops; i++) {

                let tempOutput = [];

                this.synthesize();

                this.clusterize();

                tempOutput = this.sentences.flatMap(sentence =>
                    sentence.evaluate().filter(value => ReimSY.processHash(value, this.outputHashtable))
                );

                this.createMathFormulas(tempOutput);

                tempOutput.pushArray(this.evalMath().filter(value => ReimSY.processHash(value, this.outputHashtable)));

                let newInformation = ReimSY.filterUniqueSubarrays(this.output, tempOutput)

                this.output.pushArray(newInformation);

                this.addBatch(newInformation)

            }


            return this.output;
        }


        createMathFormulas(input) {

            input.forEach(subArray => {

                if (subArray[1] === "=" && ReimSY.isNumber(subArray[2]) === false) {

                    let mathFormula = new MathFormula(subArray);

                    this.allValidFormulas.push(mathFormula)


                }
            });


            input.forEach(subArray => {

                if (subArray[1] === "=" && ReimSY.isNumber(subArray[2]) === true) {

                    let key = subArray[0];
                    let value = subArray[2];

                    this.allValidFormulas.forEach(formula => {

                        if (formula.dependencies.hasOwnProperty(key)) {

                            formula.dependencies[key] = parseFloat(value);

                        }
                    });
                }
            });

        }


        evalMath() {
            let mathOutput = [];

            for (const formula of this.allValidFormulas) {

                let newValue = formula.evaluate();
                let newProposition = [formula.name, "=", newValue.toString()]

                mathOutput.push(newProposition);

            }

            return mathOutput;
        }


        debug() {

            this.sentences.forEach(sentence => {

                sentence.debug();

            });
        }



    }

    class Observable {
        constructor() {
            this.valid = false;
            this.children = [];
            this.childOf = [];
        }

        addChild(child) {
            this.children.push(child);
            child.childOf.push(this);
        }

        updateFromChildren() {
            this.children.forEach(child => {
                child.updateFromChildren();
                if (!child.valid && this.valid !== false) {
                    this.updateValid(false);
                }
            });
        }

        updateValid(value) {
            this.valid = value;
            this.childOf.forEach(parent => {
                if (parent.valid !== false) {
                    parent.updateValid(false);
                }
            });
        }
    }


    class MathFormula {
        constructor(formula) {
            this.formula = formula;
            this.result = null;
            this.name = formula[0];
            this.formContent = formula[2];
            this.compute = this.createFunction(this.formContent);
            this.dependencies = this.extractVariables(this.formContent);

        }

        createFunction(formula) {

            formula = formula.replace(/\b(?!sqrt|sin|cos|tan|PI)[a-zA-Z]+\b/g, 'params.$&');
            formula = formula.replace(/\^/g, '**');
            formula = formula.replace(/sqrt/g, 'Math.sqrt');
            formula = formula.replace(/sin/g, 'Math.sin');
            formula = formula.replace(/cos/g, 'Math.cos');
            formula = formula.replace(/tan/g, 'Math.tan');
            formula = formula.replace(/PI/g, 'Math.PI');

            return new Function('params', 'return ' + formula);

        }

        evaluate() {

            this.result = this.compute(this.dependencies);

            return this.result;
        }

        extractVariables(formula) {
            const regex = /\b(?!sqrt|sin|cos|tan|pi)[a-zA-Z]+\b/g;
            const variables = formula.match(regex) || [];
            const variablesObject = {};
            variables.forEach(name => {
                variablesObject[name] = undefined;
            });

            return variablesObject;
        }
    }

    class Sentence extends Observable {
        constructor(root, phraseFinder) {
            super();
            this.root = root;
            this.output = [];
            this.phraseGroups = {};
            this.validClusters = [];
            this.valid = false;
            this.simpleTruth = false;
            this.phraseFinder = phraseFinder;


        }

        addChild(newPhrase) {

            const grouphead = newPhrase.head;
            let group = this.phraseGroups[grouphead];

            if (!group) {
                group = new PhraseGroup(grouphead);
                this.phraseGroups[grouphead] = group;
            }

            group.addChild(newPhrase);
        }

        clear() {

        }

        synthesize() {
            if (Object.keys(this.phraseGroups).length === 0) {

                this.simpleTruth = true;
                this.valid = true;

                const parentPhrases = this.phraseFinder.getValues(this.root, true);

                parentPhrases.forEach(parentPhrase => {
                    if (parentPhrase) {



                        parentPhrase.addChild(this);

                    }
                });

            }
        }


        clusterize() {
            Object.values(this.phraseGroups).forEach(group => {
                group.clusterize();
            });
        }

        evaluate() {

            if (this.simpleTruth === false) {

                this.validClusters = Object.values(this.phraseGroups).flatMap(group => group.evaluate());

                this.output = this.cluster2Output();


                if (this.root.includes("%Result")) {

                    this.output = [this.root];

                    let counterFunktion;

                    Object.values(this.phraseGroups).forEach(group => {
                        counterFunktion = group.logicFunction;
                    });


                    let counterResult = counterFunktion(null, this.validClusters.length);

                    // Ersetze %Result in allen Unterarrays durch den berechneten Wert
                    this.output = this.output.map(subArray =>
                        subArray.map(element =>
                            element === "%Result" ? counterResult : element
                        )
                    );

                }



            } else {
                this.output = [this.root];
            }

            return this.output;
        }


        cluster2Output() {
            const uniqueOutput = new Set();

            this.validClusters.forEach(cluster => {
                const outputRoot = this.root.map(token => {
                    if (token.startsWith('%')) {
                        const assumption = [...cluster.assumptions].find(([key, value]) => key === token);
                        return assumption ? assumption[1] : token;
                    }
                    return token;
                });

                uniqueOutput.add(JSON.stringify(outputRoot));
            });

            return [...uniqueOutput].map(item => JSON.parse(item));
        }


        debug() {

            console.log("%cProposition pattern:", "color: green;", this.root.join(' '));

            Object.values(this.phraseGroups).forEach(group => {
                group.debug();
            });

        }

    }

    class PhraseGroup extends Observable {
        constructor(head) {
            super();
            this.head = head;
            this.logicFunction = ReimSY.PHRASETYPES.find(([type, func]) => type === head)?.[1] || null;
            this.clusters = [];
        }

        clusterize() {

            this.clusters = [];

            this.children.forEach(entry => {

                entry.clusterize();

            });
            this.createClusterRoots();

            this.extendClusters()
        }

        // makes sure, there is always an empty cluster
        createClusterRoots() {

            this.children.forEach(entry => {

                entry.clusterElements.forEach(clusterElement => {

                    if (!this.clusters.some(existingCluster => existingCluster.rootClusterElement === clusterElement && existingCluster.children.length === 0)) {
                        const newCluster = new Cluster(clusterElement);
                        newCluster.targetNumber += 1;

                        this.clusters.push(newCluster);
                    }
                });
            });
        }

        extendClusters() {
            this.children.forEach(entry => {
                entry.clusterElements.forEach(clusterElement => {
                    this.clusters.forEach(cluster => {
                        if (cluster.matching(clusterElement)) {
                            cluster.extend(clusterElement);
                            cluster.targetNumber += 1;
                        } else {

                        }
                    });
                });
            });
        }


        evaluate() {

            return this.clusters.filter(cluster => this.logicFunction(cluster, this.children.length));
        }

        debug() {

            console.log("%c   Group citerion:", "color: red;", this.head);

            this.children.forEach(entry => {

                entry.debug();

            });

            this.clusters.forEach(entry => {

                entry.debug();

            });

        }

    }

    class Phrase extends Observable {
        constructor(input) {
            super();
            this.head = input.shift();
            this.root = input;
            this.clusterElements = [];
        }

        clusterize() {

            this.clusterElements = [];

            this.children.forEach(entry => {

                const newClusterElement = new ClusterElement(entry, this);

                this.clusterElements.push(newClusterElement);

            });

        }

        debug() {

            console.log("%c      Phrase:", "color: blue;", this.root.join(' '));

        }

    }

    class Cluster extends Observable {
        constructor(rootClusterElement) {
            super();

            this.valid = false;
            this.targetNumber = 0;
            this.rootClusterElement = rootClusterElement || [];
            this.assumptions = new Set(rootClusterElement.assumptions);
            this.clusterElements = [this.rootClusterElement];
        }

        matching(clusterElement) {
            for (let element of this.clusterElements) {
                if (element === clusterElement) {
                    return false;
                }
                if (!element.matching(clusterElement)) {
                    return false;
                }
            }
            return true;
        }

        extend(clusterElement) {
            this.clusterElements.push(clusterElement);
            clusterElement.assumptions.forEach(assumption => this.assumptions.add(assumption));
        }

        debug() {

            console.log("%c      Clusters Targetnumber: " + this.targetNumber, "color: orange;");


            this.clusterElements.forEach(entry => {

                entry.debug();

            });

        }

    }

    class ClusterElement extends Observable {
        constructor(sentence, parentphrase) {
            super();
            this.assumptions = new Set();
            this.childOf = parentphrase;
            this.origin = sentence;
            this.create(sentence, parentphrase);
        }

        create(sentence, parentphrase) {
            for (let i = 0; i < parentphrase.root.length; i++) {
                if (parentphrase.root[i].startsWith('%')) {
                    this.assumptions.add([parentphrase.root[i], sentence.root[i]]);
                }
            }
        }

        matching(otherClusterElement) {
            for (let [key, value] of this.assumptions) {
                const found = [...otherClusterElement.assumptions].find(([otherKey, otherValue]) => {
                    return otherKey === key && otherValue !== value;
                });
                if (found) {
                    return false;
                }
            }
            return true;
        }

        debug() {
            if (this.assumptions.size === 0) {
                console.log("         Simple Truth by %c" + this.origin.root.join(' '), "font-style: italic;");

            } else {

                const formattedString = Array.from(this.assumptions)
                const result = formattedString.map(item => `${item[0]}: ${item[1]}`).join("; ");


                console.log("         " + result + " by %c" + this.origin.root.join(' '), "font-style: italic;");


            }
        }

    }

    class PhraseFinder {
        constructor() {
            this.phraseFinder = {};
            this.PLACEHOLDER = '__PLACEHOLDER__';
            this.VARS = ["%A", "%B", "%C", "%D", "%E", "%X"];
        }

        addStringArray(stringArray, value) {
            let phraseFinder = this.phraseFinder;
            let arrayCopy = [...stringArray];

            while (arrayCopy.length > 0) {
                let key = arrayCopy.shift();
                phraseFinder = phraseFinder[key] || (phraseFinder[key] = arrayCopy.length === 0 ? value : {});
            }
        }

        getValues(stringArray, lazy) {
            let results = new Set();
            let arrayCopy = [...stringArray];

            this._search(this.phraseFinder, arrayCopy, results, lazy);

            return results.size > 0 ? Array.from(results) : [null];
        }

        _search(node, arrayCopy, results, lazy) {
            if (arrayCopy.length === 0) {
                if (typeof node === 'object' && node !== null) {
                    results.add(node);
                }
                return;
            }

            let key = arrayCopy.shift();

            if (node[key]) {
                this._search(node[key], [...arrayCopy], results, lazy);
            }

            if (lazy === true) {
                for (let variable of this.VARS) {
                    if (node[variable]) {
                        this._search(node[variable], [...arrayCopy], results, lazy);
                    }
                }
            }

        }
    }
    return ReimSY;

})();

let reimsy = new ReimSY();