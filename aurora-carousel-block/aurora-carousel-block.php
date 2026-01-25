<?php
/**
 * Plugin Name: Aurora Carousel Block
 * Description: Gutenberg carousel block with autoplay, arrows, dots and responsive settings (no build step required).
 * Version: 1.0.1
 * Requires at least: 6.0
 * Requires PHP: 7.4
 * Author: Jarosław Kłębucki
 * Text Domain: aurora-carousel
 */

if (!defined('ABSPATH')) exit;

function aurora_carousel_register_assets() {
    $dir = plugin_dir_path(__FILE__);
    $url = plugin_dir_url(__FILE__);

    // Styles
    wp_register_style(
        'aurora-carousel-style',
        $url . 'assets/style.css',
        array(),
        filemtime($dir . 'assets/style.css')
    );

    wp_register_style(
        'aurora-carousel-editor-style',
        $url . 'assets/editor.css',
        array('wp-edit-blocks'),
        filemtime($dir . 'assets/editor.css')
    );

    // Frontend script
    wp_register_script(
        'aurora-carousel-frontend',
        $url . 'assets/frontend.js',
        array(),
        filemtime($dir . 'assets/frontend.js'),
        true
    );

    // Editor script
    wp_register_script(
        'aurora-carousel-editor',
        $url . 'assets/editor.js',
        array('wp-blocks', 'wp-i18n', 'wp-element', 'wp-block-editor', 'wp-components'),
        filemtime($dir . 'assets/editor.js'),
        true
    );

    // Parent block registration
    register_block_type('aurora/carousel', array(
        'api_version'   => 2,
        'editor_script' => 'aurora-carousel-editor',
        'editor_style'  => 'aurora-carousel-editor-style',
        'style'         => 'aurora-carousel-style',
        'script'        => 'aurora-carousel-frontend',
    ));

    // Slide block registration
    register_block_type('aurora/carousel-slide', array(
        'api_version'   => 2,
        'editor_script' => 'aurora-carousel-editor',
        'editor_style'  => 'aurora-carousel-editor-style',
        'style'         => 'aurora-carousel-style',
    ));
}
add_action('init', 'aurora_carousel_register_assets');
