export default function Spinner(){
return (
<svg width="20" height="20" viewBox="0 0 50 50" role="progressbar" aria-label="Carregando">
<circle cx="25" cy="25" r="20" fill="none" stroke="currentColor" strokeWidth="5" strokeOpacity="0.2"/>
<path d="M25 5 a20 20 0 0 1 0 40" fill="none" stroke="currentColor" strokeWidth="5">
<animateTransform attributeName="transform" type="rotate" from="0 25 25" to="360 25 25" dur="0.8s" repeatCount="indefinite"/>
</path>
</svg>
);
}