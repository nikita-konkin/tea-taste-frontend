import React from 'react';
import { Link } from 'react-router-dom';
import { teaTypeSlugs } from '../utils/teaTypes.js';

// The site's public link graph, present on every page a signed-out visitor can
// reach.
//
// The side menu was the only place with real <NavLink>s, and it is unmounted
// until someone taps the hamburger — so nothing reading the HTML ever saw a
// link, and almost everything in it is a signed-in page that robots.txt
// disallows anyway. This carries the links that are actually public, always
// rendered, in the markup.
function SiteFooter() {
    return (
        <footer className="sitefooter">
            <nav className="sitefooter__section" aria-label="Разделы сайта">
                <span className="sitefooter__title">Форма чая</span>
                <Link className="sitefooter__link" to="/">О сайте</Link>
                <Link className="sitefooter__link" to="/blog">Лента дегустаций</Link>
                <Link className="sitefooter__link" to="/sign-up">Завести свой дневник</Link>
            </nav>

            <nav className="sitefooter__section" aria-label="Дегустации по типу чая">
                <span className="sitefooter__title">Типы чая</span>
                <ul className="sitefooter__types">
                    {teaTypeSlugs.map(({ slug, short }) => (
                        <li key={slug}>
                            <Link className="sitefooter__link" to={`/blog/type/${slug}`}>{short}</Link>
                        </li>
                    ))}
                </ul>
            </nav>
        </footer>
    );
}

export default SiteFooter;
