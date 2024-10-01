const fs = require('fs');
const path = require('path');

const data = fs.readFileSync(path.join(__dirname, 'CFPackages35a2206e-4749-11ee-bd42-0216deadb111.json'), 'utf8');

fs.writeFileSync(path.join(__dirname, 'output.json'), JSON.stringify(buildTree(JSON.parse(data)), null, 2));

function buildTree(data) {
    const tree = {};
    const items = {};

    data.CFItems.forEach(item => {
        items[item.humanCodingScheme] = { ...item, children: [] };
    });

    function setParentProperties(node, parentProperties) {
        if (node.CFItemType !== 'Strand') {
            node.parent = parentProperties.currentParent;
        }

        if (node.CFItemType === 'Learning Outcome') {
            node.parentStrand = parentProperties.strand;
            node.parentStrandCode = parentProperties.strandCode;
            node.parentSubstrand = parentProperties.substrand;
            node.parentSubstrandCode = parentProperties.substrandCode;
            node.parentSkill = parentProperties.skill;
            node.parentSubskill = parentProperties.subskill;
        }

        node.children.forEach(child => {
            const newParentProperties = { ...parentProperties };
            if (node.CFItemType === 'Strand') newParentProperties.strand = node.fullStatement;
            if (node.CFItemType === 'Strand') newParentProperties.strandCode = node.humanCodingScheme;
            if (node.CFItemType === 'Content Area' || node.CFItemType === 'Substrand') newParentProperties.substrand = node.fullStatement;
            if (node.CFItemType === 'Content Area' || node.CFItemType === 'Substrand') newParentProperties.substrandCode = node.humanCodingScheme;
            if (node.CFItemType === 'Skill Area 1' || node.CFItemType === 'Skill') newParentProperties.skill = node.fullStatement;
            if (node.CFItemType === 'Skill Area 2' || node.CFItemType === 'Subskill') newParentProperties.subskill = node.fullStatement;

            newParentProperties.currentParent = node.fullStatement;
            setParentProperties(child, newParentProperties);
        });
    }

    data.CFAssociations.forEach(assoc => {
        const parent = items[assoc.destinationNodeURI.title];
        const child = items[assoc.originNodeURI.title];
        if (parent && child) {
            parent.children.push(child);
        }
    });

    Object.values(items).forEach(item => {
        const topLevelKey = `${item.CFItemType}`;
        tree[topLevelKey] = tree[topLevelKey] || [];
        tree[topLevelKey].push(item);

        if (item.CFItemType === 'Strand') {
            setParentProperties(item, { strand: '', substrand: '', skill: '', subskill: '', currentParent: '' });
        }
    });

    return tree;
}