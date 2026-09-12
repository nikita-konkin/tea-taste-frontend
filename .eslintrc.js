// Create React App's own rules, which the dev server and the production build
// already run — this file only makes them runnable on demand (`npm run lint`)
// and in CI, and turns off two test rules that fight what these tests exist to
// check.
//
// Deliberately NOT airbnb: the source is split between tabs and four spaces by
// file, and a whole-repo reindent would bury every real finding under thousands
// of whitespace lines. react-app's rules are about mistakes, not style.
module.exports = {
    root: true,
    extends: ['react-app', 'react-app/jest'],
    overrides: [
        {
            files: ['**/__tests__/**/*.{js,jsx}', '**/*.test.{js,jsx}'],
            rules: {
                // Several suites assert on things Testing Library's queries
                // cannot reach: the <head> tags PageMeta writes, the href of
                // every link inside one <nav>, the hidden file input a styled
                // label wraps. Reaching for the node IS the test.
                'testing-library/no-node-access': 'off',

                // The rule assumes a render result is being named; these call
                // sites name the mock the harness returns instead.
                'testing-library/render-result-naming-convention': 'off',

                // The harness components in these files are three lines of stub
                // standing in for a provider. They have no lifecycle to get wrong.
                'react-hooks/exhaustive-deps': 'off',
            },
        },
    ],
};
