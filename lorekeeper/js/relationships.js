document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('relationship-map');
    const nodes = new vis.DataSet(lorekeeperData.entries.map(entry => ({
        id: entry.id,
        label: entry.title
    })));
    const edges = new vis.DataSet(
        lorekeeperData.entries.flatMap(entry => entry.links.map(link => ({
            from: entry.id,
            to: link.toId,
            label: link.label
        })))
    );
    const data = { nodes, edges };
    const options = {
        edges: { arrows: 'to' },
        physics: { enabled: true }
    };
    new vis.Network(container, data, options);
});
