document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('timeline');
    const items = new vis.DataSet([
        { id: 1, content: 'Hero Born', start: '2020-01-01' },
        { id: 2, content: 'Village Founded', start: '2015-06-15' },
    ]);
    const options = {
        width: '100%',
        height: '400px',
        margin: { item: 20 }
    };
    new vis.Timeline(container, items, options);
});