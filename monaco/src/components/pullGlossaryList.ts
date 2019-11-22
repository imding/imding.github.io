
export default async function pullGLossaryList() {
    const glossaryLinks = { html: {}, css: {}, javascript: {} };

    try {
        const res = await fetch('https://glossary-api-r1.bsd.education/api/glossary/');
        const json = await res.json();

        json.data.forEach(g => glossaryLinks[g.category][g.term] = g.glossaryUuid);
        console.log('Glossary list successfully updated.');
    }
    catch (err) {
        alert('Failed to load glossary list, check console for details.');
        console.warn(err);
    }
}